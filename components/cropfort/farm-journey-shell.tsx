"use client";

import { useState } from "react";
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
  const notInWorkbook = [
    ...(rates?.nonWorkbookRateLines ?? []),
    ...(rates?.nonWorkbookLaborCards ?? []),
  ];
  const uniqueNotInWorkbook = [...new Set(notInWorkbook)];

  return (
    <div className="mt-4 border-t pt-4">
      <p className="mb-2 text-xs text-muted-foreground">
        Load the Chaka Buna simulator workbook to populate blocks, benchmarks, rate cards, the fee
        schedule, elections and the activity plan in one pass.
      </p>
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
      {message ? <p className="mt-2 text-xs text-destructive">{message}</p> : null}
      {result ? (
        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
          {setup ? (
            <li>
              {setup.blocksCreated + setup.blocksUpdated} blocks, term start {setup.termStartDate}
            </li>
          ) : null}
          {rates ? (
            <li>
              {rates.laborCards + rates.laborCardsRefreshed} labour rate cards,{" "}
              {rates.materialServiceLines + rates.materialServiceRefreshed} material/service rates
              in sync
            </li>
          ) : null}
          {benchmarks ? (
            <li>
              {benchmarks.imported + (benchmarks.refreshed ?? 0) + (benchmarks.unchanged ?? 0)} of{" "}
              {benchmarks.tier1Total} Tier 1 benchmarks in sync
            </li>
          ) : null}
          {election ? (
            <li>
              {election.elections} elections, {election.activityPlans} planned activities
            </li>
          ) : null}
          {result.completedStages?.length ? (
            <li>{result.completedStages.length} stages marked complete</li>
          ) : null}
          {setup?.unmatchedExistingBlocks.length ? (
            <li className="text-amber-700">
              Kept pre-existing blocks not in the workbook: {setup.unmatchedExistingBlocks.join(", ")}
            </li>
          ) : null}
          {uniqueNotInWorkbook.length ? (
            <li className="text-amber-700">
              Kept rates the workbook does not define: {uniqueNotInWorkbook.join(", ")}
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
  const planYear = 2026;
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
      <p className="text-sm text-muted-foreground">
        Confirm per-farm material, service, and labor rate cards in the Rate Card tab.
      </p>
    );
  }
  if (stageKey === "fee_schedule_set") {
    return (
      <p className="text-sm text-muted-foreground">
        Enter Core Services annual fee and elective line items (separate from field opex).
      </p>
    );
  }
  if (stageKey === "tier_election") {
    const elected = elections?.filter((e) => e.elected).length ?? 0;
    return (
      <div className="space-y-2 text-sm">
        <p>{elected} elected activities</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => farmPlatformApi.setCoreBundle(farmId, true)}
        >
          Elect core bundle
        </Button>
      </div>
    );
  }
  if (stageKey === "activity_plan") {
    const withQty = plans?.filter((p) => p.plannedQty && p.plannedQty > 0).length ?? 0;
    return <p className="text-sm">Activity plans with quantities: {withQty}</p>;
  }
  if (stageKey === "master_plan_calendar") {
    return (
      <p className="text-sm text-muted-foreground">
        Read-only calendar generated from term start date and election windows.
      </p>
    );
  }
  if (stageKey === "supervisor_progress") {
    return (
      <p className="text-sm text-muted-foreground">
        Enter weekly % complete (0/25/50/75/100) per elected activity plan.
      </p>
    );
  }
  if (stageKey === "budgets_cash_flow") {
    const totals = rollup as { totals?: { labor?: number } } | undefined;
    return (
      <p className="text-sm">
        Budget rollup labor ETB: {totals?.totals?.labor?.toLocaleString() ?? "—"}
      </p>
    );
  }
  if (stageKey === "monthly_client_report") {
    return (
      <p className="text-sm text-muted-foreground">
        Generated report with KPIs, risk register, and standing assurance note. Human review before send.
      </p>
    );
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
    return <p className="text-sm text-muted-foreground">Loading farm journey…</p>;
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

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="p-4">
        <h2 className="mb-1 font-semibold">{farmName || "Farm journey"}</h2>
        <p className="mb-4 text-xs text-muted-foreground">Cropfort Field OS setup</p>
        <ol className="space-y-2">
          {journey.stages.map((stage) => (
            <li key={stage.key}>
              <button
                type="button"
                disabled={stage.status === "locked"}
                onClick={() => setSelectedKey(stage.key)}
                className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm ${
                  stage.key === activeKey ? "bg-muted" : ""
                } ${stage.status === "locked" ? "cursor-not-allowed opacity-50" : "hover:bg-muted/60"}`}
                title={stage.gateReasons.join(" ") || undefined}
              >
                <StageIcon status={stage.status} />
                <span className="flex-1">
                  <span className="font-medium">{stage.order}. {stage.label}</span>
                  {stage.status === "complete" ? (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Done
                    </Badge>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <SeedFromWorkbook farmId={farmId} />
      </Card>

      <Card className="p-6">
        {selected ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{selected.label}</h3>
                <p className="text-sm text-muted-foreground capitalize">Status: {selected.status}</p>
              </div>
              {selected.status === "active" && selected.gatePassed ? (
                <Button
                  size="sm"
                  disabled={completeStage.isPending}
                  onClick={() => completeStage.mutate(selected.key)}
                >
                  Mark stage complete
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
