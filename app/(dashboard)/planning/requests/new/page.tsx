"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateActivityRequest, useWorkListOptions } from "@/hooks/use-activity-requests";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/layout/page-shell";
import { PipelineStepper } from "@/components/planning/pipeline-stepper";

const schema = z.object({
  requestType: z.enum([
    "coffee_testing",
    "farm_status_assessment",
    "soil_analysis",
    "quality_audit",
    "infrastructure_inspection",
    "urgent_field_work",
    "other",
  ]),
  title: z.string().min(1, "Required").max(200),
  description: z.string().max(2000).optional(),
  urgency: z.enum(["normal", "high", "urgent"]),
  farmEstateId: z.string().optional(),
  blockCode: z.string().optional(),
  activityCatalogId: z.string().optional(),
  suggestedAfpLineId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPE_LABELS: Record<FormData["requestType"], string> = {
  coffee_testing: "Coffee testing / cupping",
  farm_status_assessment: "Farm status assessment",
  soil_analysis: "Soil analysis",
  quality_audit: "Quality audit",
  infrastructure_inspection: "Infrastructure inspection",
  urgent_field_work: "Urgent field work",
  other: "Other",
};

export default function NewActivityRequestPage() {
  const router = useRouter();
  const create = useCreateActivityRequest();
  const { data: workList } = useWorkListOptions();
  const { data: estates = [] } = useFarmEstates({ status: "active" });
  const [catalogPick, setCatalogPick] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      requestType: "other",
      urgency: "normal",
      title: "",
      description: "",
    },
  });

  const catalog = workList?.catalog ?? [];
  const selectedEstateId = watch("farmEstateId");
  const selectedEstate = useMemo(
    () => estates.find((e) => e.id === selectedEstateId),
    [estates, selectedEstateId],
  );

  const onCatalogChange = (id: string) => {
    setCatalogPick(id);
    const item = catalog.find((c) => c.id === id);
    if (!item) {
      setValue("activityCatalogId", undefined);
      return;
    }
    setValue("activityCatalogId", item.id);
    setValue("suggestedAfpLineId", item.afpLineId);
    setValue("title", item.nameEn);
    if (item.operatingDiscipline?.toLowerCase().includes("quality")) {
      setValue("requestType", "quality_audit");
    }
  };

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync({
      requestType: data.requestType,
      title: data.title,
      description: data.description || null,
      urgency: data.urgency,
      farmEstateId: data.farmEstateId || null,
      blockCode: data.blockCode || null,
      activityCatalogId: data.activityCatalogId || null,
      suggestedAfpLineId: data.suggestedAfpLineId || null,
    });
    router.push("/planning/requests");
  };

  return (
    <PageShell>
      <div className="space-y-1 max-w-xl">
        <h1 className="font-display text-2xl font-semibold tracking-tight">New request</h1>
        <PipelineStepper activeIndex={0} />
        <p className="text-sm text-muted-foreground">
          Optional: link a vendor work-list activity so SPX can convert against the right AFP.
        </p>
      </div>

      <Card className="max-w-xl p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {catalog.length > 0 ? (
            <div className="space-y-1.5">
              <Label>From work list (optional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={catalogPick}
                onChange={(e) => onCatalogChange(e.target.value)}
              >
                <option value="">— Free-text / extra work —</option>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({c.afpLineId})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label>Type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("requestType")}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="e.g. Cupping panel Lot X" />
            {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("urgency")}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Estate</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("farmEstateId")}
              >
                <option value="">—</option>
                {(estates || []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEstate?.blocks?.length ? (
            <div className="space-y-1.5">
              <Label>Block</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("blockCode")}
              >
                <option value="">—</option>
                {selectedEstate.blocks.map((b: { code: string; label?: string }) => (
                  <option key={b.code} value={b.code}>
                    {b.label || b.code}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {watch("suggestedAfpLineId") ? (
            <p className="text-xs text-muted-foreground">
              Suggested AFP: <span className="font-mono">{watch("suggestedAfpLineId")}</span>
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/planning/requests">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>
              {create.isPending ? "Submitting…" : "Submit to SPX"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
