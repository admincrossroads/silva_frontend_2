"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";

const schema = z.object({
  workOrderId: z.string().min(1, "Required"),
  paymentRequestId: z.string().min(1, "Required"),
  type: z.string().min(1, "Required"),
  payee: z.string().min(1, "Required"),
  amountEtb: z.coerce.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof schema>;

interface SettlementFormProps {
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function SettlementForm({ onSubmit, isPending }: SettlementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="workOrderId"
        label="Work Order ID"
        placeholder="Enter work order ID"
        error={errors.workOrderId?.message}
        {...register("workOrderId")}
      />
      <Input
        id="paymentRequestId"
        label="Payment Request ID"
        placeholder="Enter payment request ID"
        error={errors.paymentRequestId?.message}
        {...register("paymentRequestId")}
      />
      <Select
        id="type"
        label="Type"
        error={errors.type?.message}
        {...register("type")}
      >
        <option value="">Select type</option>
        <option value="bagro_fee">Bagro Fee</option>
        <option value="retainer">Retainer</option>
        <option value="variable">Variable</option>
        <option value="capex">Capex</option>
      </Select>
      <Input
        id="payee"
        label="Payee"
        placeholder="Enter payee name"
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Settlement"}
        </Button>
      </div>
    </form>
  );
}
