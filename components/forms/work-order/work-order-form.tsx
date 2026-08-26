"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { useAfes } from "@/hooks/use-afes";
import { useVendors } from "@/hooks/use-vendors";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import { activityCatalogApi } from "@/lib/api/activity-catalog";
import type { Vendor } from "@/types";

const CATEGORIES = [
  { value: "Nursery", label: "Nursery" },
  { value: "Young Coffee Care", label: "Young Coffee Care" },
  { value: "Mature Coffee Care", label: "Mature Coffee Care" },
  { value: "Infilling", label: "Infilling" },
  { value: "Harvest & Post-Harvest", label: "Harvest & Post-Harvest" },
  { value: "Silviculture", label: "Silviculture" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Other", label: "Other" },
] as const;

const workOrderSchema = z
  .object({
    afeId: z.string().min(1, "AFE is required"),
    assignedVendorId: z.string().min(1, "Execution vendor is required"),
    farmEstateId: z.string().optional(),
    blockIds: z.array(z.string()).default([]),
    activityCatalogId: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    activity: z.string().min(1, "Activity is required"),
    tier: z.enum(["retainer", "project", "special"], { required_error: "Tier is required" }),
    weekStart: z.coerce.number().int().min(1, "Week 1–52").max(52),
    weekEnd: z.coerce.number().int().min(1, "Week 1–52").max(52),
    spxOversightHoursL1: z.coerce.number().int().min(0).default(0),
    spxOversightHoursL2: z.coerce.number().int().min(0).default(0),
    spxOversightHoursL3: z.coerce.number().int().min(0).default(0),
  })
  .refine((v) => v.weekEnd >= v.weekStart, {
    message: "Week end must be ≥ week start",
    path: ["weekEnd"],
  });

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  onSubmit: (values: Record<string, unknown>) => void;
  isPending?: boolean;
}

export function WorkOrderForm({ onSubmit, isPending }: WorkOrderFormProps) {
  const { data: afes = [] } = useAfes({ status: "approved,active", pageSize: 100 });
  const { data: vendorsRaw } = useVendors({ pageSize: 100 });
  const { data: estates = [] } = useFarmEstates({ status: "active" });

  const vendors = useMemo(() => {
    const list = Array.isArray(vendorsRaw) ? vendorsRaw : [];
    return list.filter((v: Vendor) => v.status === "active" || v.status === "pending" || !v.status);
  }, [vendorsRaw]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      blockIds: [],
      spxOversightHoursL1: 0,
      spxOversightHoursL2: 0,
      spxOversightHoursL3: 0,
      tier: "project",
    },
  });

  const afeId = watch("afeId");
  const farmEstateId = watch("farmEstateId");
  const activityCatalogId = watch("activityCatalogId");
  const blockIds = watch("blockIds") || [];

  const selectedAfe = afes.find((a) => a.id === afeId);
  const selectedEstate = estates.find((e) => e.id === farmEstateId);

  const catalogQuery = useQuery({
    queryKey: ["activity-catalog", selectedAfe?.afpLineId],
    queryFn: () => activityCatalogApi.list({ afpLineId: selectedAfe!.afpLineId ?? undefined }),
    enabled: Boolean(selectedAfe?.afpLineId),
  });
  const catalog = catalogQuery.data ?? [];

  useEffect(() => {
    setValue("blockIds", []);
  }, [farmEstateId, setValue]);

  useEffect(() => {
    if (!activityCatalogId) return;
    const entry = catalog.find((c) => c.id === activityCatalogId);
    if (!entry) return;
    setValue("category", entry.sectionLabel || entry.sectionCode);
    setValue("activity", entry.nameEn);
  }, [activityCatalogId, catalog, setValue]);

  const estateVendors = selectedEstate?.vendors?.length
    ? vendors.filter((v) => selectedEstate.vendors.some((ev) => ev.id === v.id))
    : vendors;

  const submit = (values: WorkOrderFormValues) => {
    onSubmit({
      afeId: values.afeId,
      assignedVendorId: values.assignedVendorId,
      category: values.category,
      activity: values.activity,
      tier: values.tier,
      weekStart: values.weekStart,
      weekEnd: values.weekEnd,
      spxOversightHoursL1: values.spxOversightHoursL1,
      spxOversightHoursL2: values.spxOversightHoursL2,
      spxOversightHoursL3: values.spxOversightHoursL3,
      activityCatalogId: values.activityCatalogId || null,
      blockIds: values.blockIds?.length ? values.blockIds : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Select id="afeId" label="AFE (approved / active)" error={errors.afeId?.message} {...register("afeId")}>
        <option value="">Select approved AFE…</option>
        {afes.map((a) => (
          <option key={a.id} value={a.id}>
            {a.id} – {a.description} ({a.band}, {a.status})
          </option>
        ))}
      </Select>
      {afes.length === 0 ? (
        <p className="text-xs text-muted-foreground">No approved or active AFEs yet. Approve an AFE first.</p>
      ) : null}

      <Select
        id="farmEstateId"
        label="Farm estate (optional)"
        error={errors.farmEstateId?.message}
        {...register("farmEstateId")}
      >
        <option value="">Any / not scoped to estate</option>
        {estates.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
            {e.location ? ` · ${e.location}` : ""}
          </option>
        ))}
      </Select>

      <Select
        id="assignedVendorId"
        label="Execution vendor"
        error={errors.assignedVendorId?.message}
        {...register("assignedVendorId")}
      >
        <option value="">Select vendor…</option>
        {estateVendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
            {v.insuranceOnFile === false ? " (insurance missing)" : ""}
          </option>
        ))}
      </Select>

      {selectedEstate?.blocks?.length ? (
        <div>
          <p className="mb-2 text-sm font-medium">Farm blocks</p>
          <div className="flex flex-wrap gap-2">
            {selectedEstate.blocks.map((b) => {
              const checked = blockIds.includes(b.id);
              return (
                <label
                  key={b.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? blockIds.filter((id) => id !== b.id)
                        : [...blockIds, b.id];
                      setValue("blockIds", next, { shouldValidate: true });
                    }}
                  />
                  {b.code}
                  {b.label ? ` · ${b.label}` : ""}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {catalog.length > 0 ? (
        <Select
          id="activityCatalogId"
          label="Work-plan activity (optional)"
          error={errors.activityCatalogId?.message}
          {...register("activityCatalogId")}
        >
          <option value="">Manual activity below…</option>
          {catalog.map((c) => (
            <option key={c.id} value={c.id}>
              {c.sectionLabel}: {c.nameEn}
            </option>
          ))}
        </Select>
      ) : null}

      <Select id="category" label="Category" error={errors.category?.message} {...register("category")}>
        <option value="">Select category</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>

      <Input id="activity" label="Activity" error={errors.activity?.message} {...register("activity")} />

      <Select id="tier" label="Tier" error={errors.tier?.message} {...register("tier")}>
        <option value="retainer">Retainer</option>
        <option value="project">Project</option>
        <option value="special">Special</option>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="weekStart"
          label="Week start"
          type="number"
          min={1}
          max={52}
          error={errors.weekStart?.message}
          {...register("weekStart")}
        />
        <Input
          id="weekEnd"
          label="Week end"
          type="number"
          min={1}
          max={52}
          error={errors.weekEnd?.message}
          {...register("weekEnd")}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          id="spxL1"
          label="SPX hours L1"
          type="number"
          min={0}
          error={errors.spxOversightHoursL1?.message}
          {...register("spxOversightHoursL1")}
        />
        <Input
          id="spxL2"
          label="SPX hours L2"
          type="number"
          min={0}
          error={errors.spxOversightHoursL2?.message}
          {...register("spxOversightHoursL2")}
        />
        <Input
          id="spxL3"
          label="SPX hours L3"
          type="number"
          min={0}
          error={errors.spxOversightHoursL3?.message}
          {...register("spxOversightHoursL3")}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Creates a <strong>draft</strong> work order. Issue it after insurance is on file for the vendor.
      </p>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending || afes.length === 0}>
          {isPending ? "Creating…" : "Create work order"}
        </Button>
      </div>
    </form>
  );
}
