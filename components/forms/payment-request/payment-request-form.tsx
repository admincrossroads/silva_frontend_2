"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";

const schema = z.object({
  workOrderId: z.string().min(1, "Required"),
  fieldTicketId: z.string().min(1, "Required"),
  type: z.enum(["bagro_fee", "retainer", "variable", "capex"]),
  amountRequestedEtb: z.coerce.number().positive("Must be positive"),
});

type FormValues = z.infer<typeof schema>;

interface PaymentRequestFormProps {
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function PaymentRequestForm({ onSubmit, isPending }: PaymentRequestFormProps) {
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
        id="fieldTicketId"
        label="Field Ticket ID"
        placeholder="Enter field ticket ID"
        error={errors.fieldTicketId?.message}
        {...register("fieldTicketId")}
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
        id="amountRequestedEtb"
        label="Amount (ETB)"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amountRequestedEtb?.message}
        {...register("amountRequestedEtb")}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Payment Request"}
        </Button>
      </div>
    </form>
  );
}
