"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { useFieldTickets } from "@/hooks/use-field-tickets";

const PAYMENT_REQUEST_TYPES = [
  { value: "bagro_fee", label: "Service fee" },
  { value: "reimbursable_cost", label: "Reimbursable cost" },
  { value: "vendor_fee", label: "Vendor fee" },
] as const;

const schema = z.object({
  fieldTicketId: z.string().min(1, "Select a validated field ticket"),
  workOrderId: z.string().min(1, "Work order is required"),
  type: z.enum(["bagro_fee", "reimbursable_cost", "vendor_fee"]),
  amountRequestedEtb: z.coerce.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof schema>;

interface PaymentRequestFormProps {
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function PaymentRequestForm({ onSubmit, isPending }: PaymentRequestFormProps) {
  const { data: fieldTickets = [], isLoading } = useFieldTickets({ status: "validated" });
  const eligibleTickets = fieldTickets.filter((ft) => !ft.paymentRequestId);

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

  const fieldTicketId = watch("fieldTicketId");
  const selectedTicket = eligibleTickets.find((ft) => ft.id === fieldTicketId);

  useEffect(() => {
    if (!selectedTicket) {
      setValue("workOrderId", "");
      return;
    }
    setValue("workOrderId", selectedTicket.workOrderId);
    if (selectedTicket.actualCostEtb != null && selectedTicket.actualCostEtb > 0) {
      setValue("amountRequestedEtb", selectedTicket.actualCostEtb);
    }
  }, [selectedTicket, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("workOrderId")} />

      <Select
        id="fieldTicketId"
        label="Validated field ticket"
        error={errors.fieldTicketId?.message}
        disabled={isLoading}
        {...register("fieldTicketId")}
      >
        <option value="">
          {isLoading ? "Loading tickets…" : "Select validated field ticket"}
        </option>
        {eligibleTickets.map((ft) => (
          <option key={ft.id} value={ft.id}>
            {ft.activityRecorded} · {new Date(ft.ticketDate).toLocaleDateString()} · {ft.areaHa?.toFixed(2) ?? "—"} ha
          </option>
        ))}
      </Select>

      {!isLoading && eligibleTickets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No validated field tickets available. A ticket must be vendor-reviewed and SPX-validated before invoicing.
        </p>
      ) : null}

      {selectedTicket ? (
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">Work order:</span> {selectedTicket.workOrderId}
          </p>
          <p>
            <span className="font-medium text-foreground">Ticket:</span> {selectedTicket.id}
          </p>
          {selectedTicket.actualCostEtb != null ? (
            <p>
              <span className="font-medium text-foreground">Recorded cost:</span>{" "}
              {selectedTicket.actualCostEtb.toLocaleString()} ETB
            </p>
          ) : null}
        </div>
      ) : null}

      <Select id="type" label="Type" error={errors.type?.message} {...register("type")}>
        {PAYMENT_REQUEST_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <Input
        id="amountRequestedEtb"
        label="Amount (ETB)"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amountRequestedEtb?.message}
        {...register("amountRequestedEtb")}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending || eligibleTickets.length === 0}>
          {isPending ? "Creating..." : "Create Payment Request"}
        </Button>
      </div>
    </form>
  );
}
