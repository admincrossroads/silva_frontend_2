"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWorkOrders } from "@/hooks/use-work-orders";

const fieldTicketSchema = z.object({
  workOrderId: z.string().min(1, "Work Order is required"),
  activityRecorded: z.string().min(1, "Activity is required"),
  areaHa: z.coerce.number().min(0, "Area must be ≥ 0"),
  laborCount: z.coerce.number().int().min(0, "Labor count must be ≥ 0"),
  materialsUsed: z.string().default(""),
  ticketDate: z.string().min(1, "Date is required"),
});

type FieldTicketFormValues = z.infer<typeof fieldTicketSchema>;

interface FieldTicketFormProps {
  onSubmit: (values: FieldTicketFormValues) => void;
  isPending?: boolean;
}

export function FieldTicketForm({ onSubmit, isPending }: FieldTicketFormProps) {
  const { data: workOrders = [] } = useWorkOrders();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldTicketFormValues>({
    resolver: zodResolver(fieldTicketSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select id="workOrderId" label="Work Order" error={errors.workOrderId?.message} {...register("workOrderId")}>
        <option value="">Select work order</option>
        {workOrders.map((wo) => (
          <option key={wo.id} value={wo.id}>
            {wo.id.slice(0, 8)} – {wo.activity}
          </option>
        ))}
      </Select>

      <Textarea id="activityRecorded" label="Activity Recorded" error={errors.activityRecorded?.message} {...register("activityRecorded")} />

      <div className="grid grid-cols-2 gap-4">
        <Input id="areaHa" label="Area (ha)" type="number" step="0.01" error={errors.areaHa?.message} {...register("areaHa")} />
        <Input id="laborCount" label="Labor Count" type="number" error={errors.laborCount?.message} {...register("laborCount")} />
      </div>

      <Input id="materialsUsed" label="Materials Used" error={errors.materialsUsed?.message} {...register("materialsUsed")} />

      <Input id="ticketDate" label="Ticket Date" type="date" error={errors.ticketDate?.message} {...register("ticketDate")} />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create Field Ticket"}
        </Button>
      </div>
    </form>
  );
}
