"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { BAND_COLORS } from "@/lib/utils/constants";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual-chart";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { Button } from "@/components/ui/button";
import { FileCheck, TrendingUp, CreditCard, Wheat } from "lucide-react";
import Link from "next/link";

export function SilvaDashboard() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "silva-owner", year],
    queryFn: () => dashboardApi.silvaOwner(year),
  });

  const bvaChartData =
    data?.budgetVsActual?.lines?.map((line: { afpLineId: string; utilizationPercent: number }) => ({
      discipline: line.afpLineId,
      budget: 100,
      actual: line.utilizationPercent,
    })) ?? [];

  const pending = data?.afePipeline?.pendingSilvaApprovalCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="AFEs pending"
          value={String(pending)}
          sublabel="Band C/D approvals"
          icon={FileCheck}
          tone={pending > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/planning/afe"
        />
        <KpiStatCard
          label="Oldest outstanding"
          value={`${data?.afePipeline?.oldestDaysOutstanding ?? 0}d`}
          sublabel="Days in queue"
          icon={TrendingUp}
          tone="blue"
          loading={isLoading}
        />
        <KpiStatCard
          label="Vendor alerts"
          value={String(data?.vendorPerformance?.belowThresholdCount ?? 0)}
          sublabel="Below score threshold"
          icon={CreditCard}
          tone="rose"
          loading={isLoading}
          href="/vendors"
        />
        <KpiStatCard
          label="Picker productivity"
          value={String(data?.harvestKpis?.pickerProductivityCurrent ?? "—")}
          sublabel="kg/day current"
          icon={Wheat}
          tone="primary"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <DashboardPanel
            title="AFE approval queue"
            viewAllHref="/planning/afe"
            contentClassName="divide-y"
            noPadding
          >
            {isLoading ? (
              <DashboardPanelEmpty message="Loading queue…" />
            ) : data?.afePipeline?.items?.length ? (
              data.afePipeline.items.map(
                (afe: { id: string; band: string; estimatedCostUsd: number; health?: string }) => (
                  <DashboardPanelRow key={afe.id} href={`/planning/afe/${afe.id}`}>
                    <span
                      className={`badge shrink-0 ${BAND_COLORS[afe.band]?.bg ?? "bg-muted"} ${BAND_COLORS[afe.band]?.text ?? ""}`}
                    >
                      Band {afe.band}
                    </span>
                    <span className="flex-1 truncate">{afe.id}</span>
                    <HealthBadge health={afe.health} />
                    <span className="font-mono font-medium tabular-nums">{formatCurrency(afe.estimatedCostUsd)}</span>
                  </DashboardPanelRow>
                ),
              )
            ) : (
              <DashboardPanelEmpty message="No AFEs pending approval" />
            )}
          </DashboardPanel>

          <DashboardPanel title="Budget utilization">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="h-[280px] animate-pulse rounded-lg bg-muted/50" />
              ) : bvaChartData.length > 0 ? (
                <>
                  <BudgetVsActualChart data={bvaChartData} />
                  <div className="space-y-1 border-t pt-3">
                    {(data?.budgetVsActual?.lines ?? []).slice(0, 5).map(
                      (line: { afpLineId: string; utilizationPercent: number; health?: string }) => (
                        <div key={line.afpLineId} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{line.afpLineId}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums">{line.utilizationPercent}%</span>
                            <HealthBadge health={line.health} />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </>
              ) : (
                <DashboardPanelEmpty message="No budget data for this year" />
              )}
            </div>
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <ActionQueueCard title="Silva approval queue" />

          <DashboardPanel title="Released reports">
            <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Monthly ready: {data?.reports?.monthlyReady ? "Yes" : "No"}
                <br />
                Yield vs baseline: {data?.harvestKpis?.yieldTrendVsBaselinePercent ?? 0}%
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/reports/monthly">Open reports</Link>
              </Button>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
}
