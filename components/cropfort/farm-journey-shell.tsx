"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Lock, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCompleteFarmStage,
  useFarmActivityPlans,
  useFarmBudgetRollup,
  useFarmElections,
  useFarmWorkflow,
} from "@/hooks/use-farm-workflow";
import { farmPlatformApi } from "@/lib/api/cropfort/farm-platform";
import { StageFarmSetup } from "@/components/cropfort/journey/stage-farm-setup";
import { StageBenchmarkSurvey } from "@/components/cropfort/journey/stage-benchmark-survey";
import type { WorkflowStage, WorkbookImportResult } from "@/lib/api/cropfort/farm-platform";

function SeedFromWorkbook({ farmId }: { farmId: string }) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<WorkbookImportResult | null>(null);

  const seed = useMutation({
    mutationFn: () => farmPlatformApi.importFarmWorkbook(farmId),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["farm-workflow", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-estates"] });
      queryClient.invalidateQueries({ queryKey: ["farm-benchmarks", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-elections", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-activity-plans", farmId] });
      queryClient.invalidateQueries({ queryKey: ["farm-budget-rollup", farmId] });
    },
  });

  const message =
    (seed.error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
      ?.message || (seed.error as Error | null)?.message;

  const setup = result?.stages.farm_block_setup;
  const election = result?.stages.tier_election;
  const rates = result?.stages.rate_cards_confirmed;
  const benchmarks = result?.stages.benchmark_survey;

  return (
    <div className="mt-4 border-t pt-4 space-y-2">
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        disabled={seed.isPending}
        onClick={() => seed.mutate()}
      >
        {seed.isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
        {seed.isPending ? "Importing…" : "Seed from workbook"}
      </Button>
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
      {result ? (
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {setup ? (
            <li>
              {setup.blocksCreated + setup.blocksUpdated} blocks
            </li>
          ) : null}
          {rates ? (
            <li>
              {rates.laborCards + rates.laborCardsRefreshed} labor ·{" "}
              {rates.materialServiceLines + rates.materialServiceRefreshed} rates
            </li>
          ) : null}
          {benchmarks ? (
            <li>
              {benchmarks.imported + (benchmarks.refreshed ?? 0) + (benchmarks.unchanged ?? 0)}{" "}
              benchmarks
            </li>
          ) : null}
          {election ? (
            <li>
              {election.elections} elections · {election.activityPlans} plans
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

type Props = {
  farmId: string;
  farmName?: string;
};

function StageIcon({ status }: { status: WorkflowStage["status"] }) {
  if (status === "complete") return <Check className="h-4 w-4 text-green-600" />;
  if (status === "locked") return <Lock className="h-4 w-4 text-muted-foreground" />;
  return <ChevronRight className="h-4 w-4 text-primary" />;
}

function StagePanel({ farmId, stageKey }: { farmId: string; stageKey: string }) {
  const planYear = new Date().getUTCFullYear();
  const { data: elections } = useFarmElections(
    stageKey === "tier_election" ? farmId : undefined,
    planYear,
  );
  const { data: plans } = useFarmActivityPlans(
    stageKey === "activity_plan" ? farmId : undefined,
    planYear,
  );
  const { data: rollup } = useFarmBudgetRollup(
    stageKey === "budgets_cash_flow" ? farmId : undefined,
    planYear,
  );

  if (stageKey === "farm_block_setup") {
    return <StageFarmSetup farmId={farmId} />;
  }
  if (stageKey === "benchmark_survey") {
    return <StageBenchmarkSurvey farmId={farmId} />;
  }
  if (stageKey === "rate_cards_confirmed") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">Confirm rates on the Rate card page.</p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/planning/rate-card">Open Rate card</Link>
        </Button>
      </div>
    );
  }
  if (stageKey === "fee_schedule_set") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">Set Core Services fee schedule and field intensity.</p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/planning/field-calendar">Open Field work calendar</Link>
        </Button>
      </div>
    );
  }
  if (stageKey === "tier_election") {
    const elected = elections?.filter((e) => e.elected).length ?? 0;
    return (
      <div className="space-y-2 text-sm">
        <p>
          Elected activities: <span className="font-medium tabular-nums">{elected}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => farmPlatformApi.setCoreBundle(farmId, true)}
          >
            Elect core bundle
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/planning/afp">Open Annual plan</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (stageKey === "activity_plan") {
    const withQty = plans?.filter((p) => p.plannedQty && p.plannedQty > 0).length ?? 0;
    return (
      <p className="text-sm">
        Plans with qty: <span className="font-medium tabular-nums">{withQty}</span>
      </p>
    );
  }
  if (stageKey === "master_plan_calendar") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">36-month P/A/L intensity from term start.</p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/planning/field-calendar">Open Field work calendar</Link>
        </Button>
      </div>
    );
  }
  if (stageKey === "supervisor_progress") {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">Track progress via Field Tickets.</p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/execution/field-tickets">Open Field Tickets</Link>
        </Button>
      </div>
    );
  }
  if (stageKey === "budgets_cash_flow") {
    const totals = rollup as { totals?: { labor?: number; material?: number; service?: number } } | undefined;
    const labor = totals?.totals?.labor;
    const material = totals?.totals?.material;
    const service = totals?.totals?.service;
    const total =
      labor != null || material != null || service != null
        ? Number(labor || 0) + Number(material || 0) + Number(service || 0)
        : null;
    return (
      <div className="space-y-2 text-sm">
        <p>
          Labor <span className="font-medium tabular-nums">{labor?.toLocaleString() ?? "—"}</span>
          {" · "}
          Material{" "}
          <span className="font-medium tabular-nums">{material?.toLocaleString() ?? "—"}</span>
          {" · "}
          Service{" "}
          <span className="font-medium tabular-nums">{service?.toLocaleString() ?? "—"}</span>
        </p>
        <p>
          Opex total <span className="font-medium tabular-nums">{total?.toLocaleString() ?? "—"}</span>
        </p>
        <Button size="sm" variant="outline" asChild>
          <Link href="/planning/budget">Open Budget</Link>
        </Button>
      </div>
    );
  }
  if (stageKey === "monthly_client_report") {
    return <p className="text-sm text-muted-foreground">Monthly client report (review before send).</p>;
  }
  return null;
}

export function FarmJourneyShell({ farmId, farmName }: Props) {
  const { data: journey, isLoading, isError, error, refetch } = useFarmWorkflow(farmId);
  const completeStage = useCompleteFarmStage(farmId);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const activeKey = selectedKey || journey?.activeStageKey || "farm_block_setup";
  const selected = journey?.stages.find((s) => s.key === activeKey);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (isError || !journey) {
    const message =
      (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
        ?.message ||
      (error as { message?: string })?.message ||
      "Could not load farm journey.";
    return (
      <div className="space-y-3 text-sm">
        <p className="text-destructive">{message}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const doneCount = journey.stages.filter((s) => s.status === "complete").length;

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card className="p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{farmName || "Stages"}</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {doneCount}/{journey.stages.length}
          </span>
        </div>
        <ol className="space-y-1">
          {journey.stages.map((stage) => (
            <li key={stage.key}>
              <button
                type="button"
                disabled={stage.status === "locked"}
                onClick={() => setSelectedKey(stage.key)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                  stage.key === activeKey ? "bg-muted" : ""
                } ${stage.status === "locked" ? "cursor-not-allowed opacity-50" : "hover:bg-muted/60"}`}
                title={stage.gateReasons.join(" ") || undefined}
              >
                <StageIcon status={stage.status} />
                <span className="flex-1 truncate">
                  {stage.order}. {stage.label}
                </span>
                {stage.status === "complete" ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Done
                  </Badge>
                ) : null}
              </button>
            </li>
          ))}
        </ol>
        <SeedFromWorkbook farmId={farmId} />
      </Card>

      <Card className="p-4">
        {selected ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{selected.label}</h3>
                <p className="text-xs capitalize text-muted-foreground">{selected.status}</p>
              </div>
              {selected.status === "active" && selected.gatePassed ? (
                <Button
                  size="sm"
                  disabled={completeStage.isPending}
                  onClick={() => completeStage.mutate(selected.key)}
                >
                  Complete
                </Button>
              ) : null}
            </div>
            {!selected.gatePassed && selected.gateReasons.length ? (
              <ul className="mb-4 list-disc pl-5 text-sm text-amber-700">
                {selected.gateReasons.slice(0, 5).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : null}
            <StagePanel farmId={farmId} stageKey={selected.key} />
          </>
        ) : null}
      </Card>
    </div>
  );
}
