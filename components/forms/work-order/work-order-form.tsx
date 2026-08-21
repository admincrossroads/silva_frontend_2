"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { useAfes } from "@/hooks/use-afes";

const workOrderSchema = z.object({
  afeId: z.string().min(1, "AFE is required"),
  category: z.string().min(1, "Category is required"),
  activity: z.string().min(1, "Activity is required"),
  tier: z.enum(["retainer", "variable", "capex"], { required_error: "Tier is required" }),
  weekStart: z.coerce.number().int().min(1).max(52),
  weekEnd: z.coerce.number().int().min(1).max(52),
  spxOversightHoursL1: z.coerce.number().min(0).default(0),
  spxOversightHoursL2: z.coerce.number().min(0).default(0),
  spxOversightHoursL3: z.coerce.number().min(0).default(0),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  onSubmit: (values: WorkOrderFormValues) => void;
  isPending?: boolean;
}

export function WorkOrderForm({ onSubmit, isPending }: WorkOrderFormProps) {
  const { data: afes = [] } = useAfes();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      spxOversightHoursL1: 0,
      spxOversightHoursL2: 0,
      spxOversightHoursL3: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select id="afeId" label="AFE" error={errors.afeId?.message} {...register("afeId")}>
        <option value="">Select AFE</option>
        {afes.map((a) => (
          <option key={a.id} value={a.id}>
            {a.id.slice(0, 8)} – {a.description}
          </option>
        ))}
      </Select>

      <Select id="category" label="Category" error={errors.category?.message} {...register("category")}>
        <option value="">Select category</option>
        <option value="silviculture">Silviculture</option>
        <option value="harvesting">Harvesting</option>
        <option value="road_maintenance">Road Maintenance</option>
        <option value="nursery">Nursery</option>
      </Select>

      <Input id="activity" label="Activity" error={errors.activity?.message} {...register("activity")} />

      <Select id="tier" label="Tier" error={errors.tier?.message} {...register("tier")}>
        <option value="">Select tier</option>
        <option value="retainer">Retainer</option>
        <option value="variable">Variable</option>
        <option value="capex">Capex</option>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input id="weekStart" label="Week Start" type="number" error={errors.weekStart?.message} {...register("weekStart")} />
        <Input id="weekEnd" label="Week End" type="number" error={errors.weekEnd?.message} {...register("weekEnd")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input id="spxL1" label="SPX Hours L1" type="number" error={errors.spxOversightHoursL1?.message} {...register("spxOversightHoursL1")} />
        <Input id="spxL2" label="SPX Hours L2" type="number" error={errors.spxOversightHoursL2?.message} {...register("spxOversightHoursL2")} />
        <Input id="spxL3" label="SPX Hours L3" type="number" error={errors.spxOversightHoursL3?.message} {...register("spxOversightHoursL3")} />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create Work Order"}
        </Button>
      </div>
    </form>
  );
}
