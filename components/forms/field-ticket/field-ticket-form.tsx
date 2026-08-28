"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { activityCatalogApi } from "@/lib/api/activity-catalog";
import { saveOfflineFieldTicketDraft } from "@/lib/offline/field-ticket-drafts";

const fieldTicketSchema = z.object({
  workOrderId: z.string().min(1, "Work Order is required"),
  activityCatalogId: z.string().optional(),
  ticketType: z.enum(["field_execution", "payroll_confirmation"]).optional(),
  activityRecorded: z.string().min(1, "Activity is required"),
  areaHa: z.coerce.number().min(0, "Area must be ≥ 0"),
  laborCount: z.coerce.number().int().min(0, "Labor count must be ≥ 0"),
  materialsUsed: z.string().default(""),
  ticketDate: z.string().min(1, "Date is required"),
  actualQuantity: z.coerce.number().min(0).optional(),
  actualMandays: z.coerce.number().min(0).optional(),
  actualCostEtb: z.coerce.number().min(0).optional(),
});

type FieldTicketFormValues = z.infer<typeof fieldTicketSchema>;

interface FieldTicketFormProps {
  onSubmit: (values: FieldTicketFormValues) => void;
  isPending?: boolean;
  offlineEnabled?: boolean;
  onOfflineSave?: () => void;
}

export function FieldTicketForm({ onSubmit, isPending, offlineEnabled, onOfflineSave }: FieldTicketFormProps) {
  const { data: workOrders = [] } = useWorkOrders();
  const { data: catalog = [] } = useQuery({
    queryKey: ["activity-catalog-all"],
    queryFn: () => activityCatalogApi.list({}),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FieldTicketFormValues>({
    resolver: zodResolver(fieldTicketSchema),
    defaultValues: { ticketType: "field_execution" },
  });

  const workOrderId = watch("workOrderId");
  const activityCatalogId = watch("activityCatalogId");
  const selectedWo = workOrders.find((wo) => wo.id === workOrderId);
  const selectedActivity = catalog.find((a) => a.id === activityCatalogId);

  useEffect(() => {
    if (selectedWo?.activityCatalogId && !activityCatalogId) {
      setValue("activityCatalogId", selectedWo.activityCatalogId);
    }
  }, [selectedWo, activityCatalogId, setValue]);

  useEffect(() => {
    if (selectedActivity) {
      setValue("activityRecorded", selectedActivity.nameEn);
      if (selectedActivity.sectionCode === "salary") {
        setValue("ticketType", "payroll_confirmation");
      }
    }
  }, [selectedActivity, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select id="workOrderId" label="Work Order" error={errors.workOrderId?.message} {...register("workOrderId")}>
        <option value="">Select work order</option>
        {workOrders.map((wo) => (
          <option key={wo.id} value={wo.id}>
            {wo.id} – {wo.activity}
          </option>
        ))}
      </Select>

      {catalog.length > 0 ? (
        <Select
          id="activityCatalogId"
          label="Planned activity (catalog)"
          error={errors.activityCatalogId?.message}
          {...register("activityCatalogId")}
        >
          <option value="">Optional — select catalog row</option>
          {catalog.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id} – {a.nameEn}
            </option>
          ))}
        </Select>
      ) : null}

      {selectedActivity ? (
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
          <p>
            Plan: {selectedActivity.annualQuantity?.toLocaleString() ?? "—"} {selectedActivity.unit} ·{" "}
            {selectedActivity.annualMandays?.toLocaleString() ?? "—"} MD ·{" "}
            {selectedActivity.annualCostEtb?.toLocaleString() ?? "—"} ETB/yr
          </p>
          {selectedActivity.normWageEtb != null ? (
            <p>
              Norm: {selectedActivity.normMdPerUnit ?? "—"} MD/{selectedActivity.unit} · wage{" "}
              {selectedActivity.normWageEtb} ETB/MD — cost ≈ actual MD × wage
            </p>
          ) : null}
        </div>
      ) : null}

      <Textarea id="activityRecorded" label="Activity Recorded" error={errors.activityRecorded?.message} {...register("activityRecorded")} />

      <div className="grid grid-cols-2 gap-4">
        <Input id="areaHa" label="Area (ha)" type="number" step="0.01" error={errors.areaHa?.message} {...register("areaHa")} />
        <Input id="laborCount" label="Labor Count" type="number" error={errors.laborCount?.message} {...register("laborCount")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input id="actualQuantity" label="Actual qty" type="number" step="0.01" {...register("actualQuantity")} />
        <Input id="actualMandays" label="Actual MD" type="number" step="0.01" {...register("actualMandays")} />
        <Input id="actualCostEtb" label="Actual cost (ETB)" type="number" step="0.01" {...register("actualCostEtb")} />
      </div>

      <Input id="materialsUsed" label="Materials Used" error={errors.materialsUsed?.message} {...register("materialsUsed")} />

      <Input id="ticketDate" label="Ticket Date" type="date" error={errors.ticketDate?.message} {...register("ticketDate")} />

      <div className="flex justify-end gap-2 pt-2">
        {offlineEnabled ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={handleSubmit((values) => {
              saveOfflineFieldTicketDraft(values);
              onOfflineSave?.();
            })}
          >
            Save offline
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create Field Ticket"}
        </Button>
      </div>
    </form>
  );
}
