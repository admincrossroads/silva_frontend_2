"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { usePaymentRequests } from "@/hooks/use-payment-requests";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { useVendors } from "@/hooks/use-vendors";

const SETTLEMENT_TYPES = [
  { value: "bagro_fee", label: "Service fee" },
  { value: "labor_wages", label: "Labor wages" },
  { value: "vendor_payment", label: "Vendor payment" },
] as const;

const schema = z.object({
  paymentRequestId: z.string().min(1, "Select a verified payment request"),
  workOrderId: z.string().min(1, "Work order is required"),
  type: z.enum(["bagro_fee", "labor_wages", "vendor_payment"]),
  payee: z.string().min(1, "Payee is required"),
  amountEtb: z.coerce.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof schema>;

function settlementTypeFromPaymentRequest(prType: string): FormValues["type"] {
  if (prType === "reimbursable_cost") return "labor_wages";
  if (prType === "vendor_fee") return "vendor_payment";
  return "bagro_fee";
}

interface SettlementFormProps {
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function SettlementForm({ onSubmit, isPending }: SettlementFormProps) {
  const { data: paymentRequests = [], isLoading } = usePaymentRequests({ status: "verified" });
  const { data: workOrders = [] } = useWorkOrders();
  const { data: vendors = [] } = useVendors({ pageSize: 100 });

  const eligibleRequests = paymentRequests.filter((pr) => !pr.settlementId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "bagro_fee" },
  });

  const paymentRequestId = watch("paymentRequestId");
  const selectedRequest = eligibleRequests.find((pr) => pr.id === paymentRequestId);

  useEffect(() => {
    if (!selectedRequest) {
      setValue("workOrderId", "");
      return;
    }

    setValue("workOrderId", selectedRequest.workOrderId);
    setValue("amountEtb", selectedRequest.amountRequestedEtb);
    setValue("type", settlementTypeFromPaymentRequest(selectedRequest.type));

    const workOrder = workOrders.find((wo) => wo.id === selectedRequest.workOrderId);
    const vendor = vendors.find((v) => v.id === workOrder?.assignedVendorId);
    if (vendor?.name) {
      setValue("payee", vendor.name);
    }
  }, [selectedRequest, workOrders, vendors, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("workOrderId")} />

      <Select
        id="paymentRequestId"
        label="Verified payment request"
        error={errors.paymentRequestId?.message}
        disabled={isLoading}
        {...register("paymentRequestId")}
      >
        <option value="">
          {isLoading ? "Loading payment requests…" : "Select verified payment request"}
        </option>
        {eligibleRequests.map((pr) => (
          <option key={pr.id} value={pr.id}>
            {pr.id} · {pr.type.replace(/_/g, " ")} · {pr.amountRequestedEtb.toLocaleString()} ETB
          </option>
        ))}
      </Select>

      {!isLoading && eligibleRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No verified payment requests available. SPX must verify a payment request before creating a settlement.
        </p>
      ) : null}

      {selectedRequest ? (
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">Work order:</span> {selectedRequest.workOrderId}
          </p>
          <p>
            <span className="font-medium text-foreground">Field ticket:</span> {selectedRequest.fieldTicketId}
          </p>
          <p>
            <span className="font-medium text-foreground">Requested:</span>{" "}
            {selectedRequest.amountRequestedEtb.toLocaleString()} ETB
          </p>
        </div>
      ) : null}

      <Select id="type" label="Type" error={errors.type?.message} {...register("type")}>
        {SETTLEMENT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <Input
        id="payee"
        label="Payee"
        placeholder="Execution partner or payee name"
        error={errors.payee?.message}
        {...register("payee")}
      />

      <Input
        id="amountEtb"
        label="Amount (ETB)"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amountEtb?.message}
        {...register("amountEtb")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending || eligibleRequests.length === 0}>
          {isPending ? "Creating..." : "Create Settlement"}
        </Button>
      </div>
    </form>
  );
}
