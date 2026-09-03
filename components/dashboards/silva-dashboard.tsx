"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual-chart";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { EstateMapHero } from "@/components/dashboards/estate-map-hero";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
import { RateCardApprovalsPanel } from "@/components/cropfort/rate-card-approvals-panel";
import { AfpBlockApprovalsPanel } from "@/components/cropfort/afp-block-approvals-panel";
import { Wallet, CreditCard, Wheat, ScrollText } from "lucide-react";

export function SilvaDashboard() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "silva-owner", year],
    queryFn: () => dashboardApi.silvaOwner(year),
  });

  const bvaLines = data?.budgetVsActual?.lines ?? [];
  const bvaChartData = bvaLines.map((line: { afpLineId: string; utilizationPercent: number }) => ({
    discipline: line.afpLineId,
    budget: 100,
    actual: line.utilizationPercent,
  }));

  const overBudget = bvaLines.filter(
    (line: { health?: string }) => line.health === "over_budget" || line.health === "Over Budget",
  ).length;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="h-[280px] animate-pulse rounded-2xl bg-muted/50" />
      ) : (
        <EstateMapHero map={data?.estateMap} />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Budget lines"
          value={String(bvaLines.length)}
          icon={Wallet}
          tone="primary"
          loading={isLoading}
          href="/planning/afp"
        />
        <KpiStatCard
          label="Over watch"
          value={String(overBudget)}
          icon={ScrollText}
          tone={overBudget > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/reports/budget-vs-actual"
        />
        <KpiStatCard
          label="Vendor alerts"
          value={String(data?.vendorPerformance?.belowThresholdCount ?? 0)}
          icon={CreditCard}
          tone="rose"
          loading={isLoading}
          href="/vendors"
        />
        <KpiStatCard
          label="Picker productivity"
          value={String(data?.harvestKpis?.pickerProductivityCurrent ?? "—")}
          sublabel="kg/day"
          icon={Wheat}
          tone="primary"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <DashboardPanel title="Budget utilization" viewAllHref="/reports/budget-vs-actual">
            <div className="space-y-3 p-4">
              {isLoading ? (
                <div className="h-[240px] animate-pulse rounded-lg bg-muted/50" />
              ) : bvaChartData.length > 0 ? (
                <>
                  <BudgetVsActualChart data={bvaChartData} />
                  <div className="space-y-1 border-t border-border/80 pt-3">
                    {bvaLines.slice(0, 5).map(
                      (line: { afpLineId: string; utilizationPercent: number; health?: string }) => (
                        <div key={line.afpLineId} className="flex items-center justify-between text-xs">
                          <span className="truncate text-muted-foreground">{line.afpLineId}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-mono tabular-nums">{line.utilizationPercent}%</span>
                            <HealthBadge health={line.health} />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </>
              ) : (
                <DashboardPanelEmpty message="No budget data" />
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Shortcuts" noPadding contentClassName="divide-y">
            <DashboardPanelRow href="/planning/afp">AFP register</DashboardPanelRow>
            <DashboardPanelRow href="/planning/afe">Commitments (AFE)</DashboardPanelRow>
            <DashboardPanelRow href="/operations/interventions">Core operations</DashboardPanelRow>
          </DashboardPanel>
        </div>

        <div className="space-y-4">
          <ActionQueueCard title="Approval queue" />
          <RateCardApprovalsPanel />
          <AfpBlockApprovalsPanel />

          <DashboardPanel title="Payments & reports" noPadding contentClassName="divide-y">
            <DashboardPanelRow href="/payments/settlements">Settlements</DashboardPanelRow>
            <DashboardPanelRow href="/reports/monthly">
              <span className="flex-1">Monthly reports</span>
              <span className="text-xs text-muted-foreground">
                {data?.reports?.monthlyReady ? "Ready" : "Pending"} · {data?.harvestKpis?.yieldTrendVsBaselinePercent ?? 0}%
              </span>
            </DashboardPanelRow>
          </DashboardPanel>
        </div>
      </div>

      <CropfortDashboardSection />
    </div>
  );
}
