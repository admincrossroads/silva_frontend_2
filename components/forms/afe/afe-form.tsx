"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAfe } from "@/hooks/use-afes";
import { useAfpBlockLines } from "@/hooks/use-afp-blocks";
import { useBudgetPreview } from "@/hooks/use-budget-preview";
import { useSchedule3 } from "@/hooks/use-schedule3";
import { computeBandFromThresholds } from "@/lib/utils/compute-band";
import { BandBadge } from "@/components/badges/band-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Schedule3Threshold } from "@/types";
import { formatEtb } from "@/lib/utils/format";

const DISCIPLINES = [
  "Agronomy",
  "Processing",
  "Infrastructure",
  "Environment",
  "Social",
  "General Admin",
];

function computeBand(cost: number, thresholds: Schedule3Threshold[] | undefined): string {
  if (!thresholds?.length) return "—";
  return computeBandFromThresholds(cost, thresholds);
}

function mapDiscipline(category?: string | null): string {
  if (!category) return "Agronomy";
  const c = category.toLowerCase();
  if (c.includes("process")) return "Processing";
  if (c.includes("infra")) return "Infrastructure";
  if (c.includes("environ")) return "Environment";
  if (c.includes("social")) return "Social";
  if (c.includes("admin")) return "General Admin";
  if (c.includes("agronom") || c.includes("field") || c.includes("harvest")) return "Agronomy";
  return "Agronomy";
}

const afeSchema = z.object({
  afpBlockLineId: z.string().min(1, "Select an elected annual plan line"),
  operatingDiscipline: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  estimatedCostEtb: z.coerce.number().positive("Must be positive — check Rate card & plan qty"),
});

type AfeFormValues = z.infer<typeof afeSchema>;

interface AfeFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<AfeFormValues>;
}

export function AfeForm({ onSuccess, defaultValues }: AfeFormProps) {
  const createAfe = useCreateAfe();
  const planYear = new Date().getFullYear();
  const { data: blockLines = [], isLoading: linesLoading } = useAfpBlockLines({
    planYear,
    status: "approved",
    electionStatus: "elected",
  });
  const { data: budget } = useBudgetPreview({ planYear });
  const { data: schedule3 = [] } = useSchedule3();

  const electedLines = useMemo(
    () => blockLines.filter((l) => l.status === "approved" && l.electionStatus === "elected"),
    [blockLines],
  );

  const budgetByLineId = useMemo(() => {
    const map = new Map<
      string,
      { total: number; labor: number; material: number; service: number; qty: number; warnings: string[] }
    >();
    for (const row of budget?.rows ?? []) {
      const key = row.lineId || `${row.blockId}:${row.activityId}`;
      map.set(key, {
        total: Number(row.totalCostEtb) || 0,
        labor: Number(row.laborCostEtb) || 0,
        material: Number(row.materialCostEtb) || 0,
        service: Number(row.serviceCostEtb) || 0,
        qty: Number(row.plannedQty) || 0,
        warnings: row.warnings ?? [],
      });
      map.set(`${row.blockId}:${row.activityId}`, {
        total: Number(row.totalCostEtb) || 0,
        labor: Number(row.laborCostEtb) || 0,
        material: Number(row.materialCostEtb) || 0,
        service: Number(row.serviceCostEtb) || 0,
        qty: Number(row.plannedQty) || 0,
        warnings: row.warnings ?? [],
      });
    }
    return map;
  }, [budget?.rows]);

  const form = useForm<AfeFormValues>({
    resolver: zodResolver(afeSchema),
    defaultValues: {
      afpBlockLineId: "",
      operatingDiscipline: "Agronomy",
      description: "",
      estimatedCostEtb: undefined as unknown as number,
      ...defaultValues,
    },
  });

  const selectedLineId = useWatch({ control: form.control, name: "afpBlockLineId" });
  const costValue = useWatch({ control: form.control, name: "estimatedCostEtb" });
  const currentBand = computeBand(Number(costValue) || 0, schedule3);

  const selectedLine = useMemo(
    () => electedLines.find((l) => l.id === selectedLineId),
    [electedLines, selectedLineId],
  );

  const derived = selectedLine
    ? budgetByLineId.get(selectedLine.id) ||
      budgetByLineId.get(`${selectedLine.blockId}:${selectedLine.activityId}`)
    : undefined;

  useEffect(() => {
    if (!selectedLine) return;
    const blockLabel = selectedLine.block?.label || selectedLine.block?.code || selectedLine.blockId;
    const activityLabel = selectedLine.activity
      ? `${selectedLine.activity.code} — ${selectedLine.activity.name}`
      : selectedLine.activityId;
    form.setValue("description", `${blockLabel}: ${activityLabel} (${selectedLine.planYear})`);
    form.setValue("operatingDiscipline", mapDiscipline(selectedLine.activity?.category));
    if (derived && derived.total > 0) {
      form.setValue("estimatedCostEtb", Number(derived.total.toFixed(2)), { shouldValidate: true });
    } else {
      form.setValue("estimatedCostEtb", undefined as unknown as number, { shouldValidate: true });
    }
  }, [selectedLine, derived, form]);

  async function onSubmit(values: AfeFormValues) {
    await createAfe.mutateAsync(values as Record<string, unknown>);
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Cost = planned qty × approved Rate card / labor rates.
        </p>

        <FormField
          control={form.control}
          name="afpBlockLineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual plan line</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        linesLoading
                          ? "Loading…"
                          : electedLines.length
                            ? "Select elected Block AFP line"
                            : "No elected approved lines"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {electedLines.map((line) => {
                    const blockLabel = line.block?.label || line.block?.code || line.blockId;
                    const activityLabel = line.activity
                      ? `${line.activity.code} — ${line.activity.name}`
                      : line.activityId;
                    const row =
                      budgetByLineId.get(line.id) ||
                      budgetByLineId.get(`${line.blockId}:${line.activityId}`);
                    return (
                      <SelectItem key={line.id} value={line.id}>
                        {blockLabel} · {activityLabel}
                        {row && row.total > 0 ? ` · ${formatEtb(row.total)}` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!linesLoading && electedLines.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No elected approved lines. Elect and approve on Annual plan first.
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedLine ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs space-y-1">
            <p>
              Qty <span className="font-medium tabular-nums">{selectedLine.plannedQty}</span>
              {derived ? (
                <>
                  {" "}
                  · Labor {formatEtb(derived.labor)} · Material {formatEtb(derived.material)} · Service{" "}
                  {formatEtb(derived.service)}
                </>
              ) : null}
            </p>
            {derived && derived.total > 0 ? (
              <p className="text-muted-foreground">From Rate card (editable).</p>
            ) : (
              <p className="text-amber-700 dark:text-amber-400">
                No derived cost. Check Rate card, labor rates, and qty.
                {derived?.warnings?.length ? ` ${derived.warnings.join(" ")}` : ""}
              </p>
            )}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="operatingDiscipline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating discipline</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedCostEtb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated cost (ETB)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Band:</span>
                {currentBand === "—" ? (
                  <span className="text-sm text-muted-foreground">Loading thresholds…</span>
                ) : (
                  <BandBadge band={currentBand} thresholds={schedule3} />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createAfe.isPending || electedLines.length === 0}
          className="w-full"
        >
          {createAfe.isPending ? "Creating..." : "Create AFE"}
        </Button>
      </form>
    </Form>
  );
}
