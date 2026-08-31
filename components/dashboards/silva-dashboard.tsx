"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual-chart";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { EstateMapHero } from "@/components/dashboards/estate-map-hero";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Wheat, ScrollText } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      {isLoading ? (
        <div className="h-[320px] animate-pulse rounded-2xl bg-muted/50" />
      ) : (
        <EstateMapHero map={data?.estateMap} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Budget lines"
          value={String(bvaLines.length)}
          sublabel="AFP utilization"
          icon={Wallet}
          tone="primary"
          loading={isLoading}
          href="/planning/afp"
        />
        <KpiStatCard
          label="Over watch"
          value={String(overBudget)}
          sublabel="Lines needing attention"
          icon={ScrollText}
          tone={overBudget > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/reports/budget-vs-actual"
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
          <DashboardPanel title="Budget utilization" viewAllHref="/reports/budget-vs-actual">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="h-[280px] animate-pulse rounded-lg bg-muted/50" />
              ) : bvaChartData.length > 0 ? (
                <>
                  <BudgetVsActualChart data={bvaChartData} />
                  <div className="space-y-1 border-t pt-3">
                    {bvaLines.slice(0, 5).map(
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

          <DashboardPanel title="AFP register" viewAllHref="/planning/afp" contentClassName="p-4">
            <p className="text-sm text-muted-foreground">
              Review and approve annual budget lines prepared by SPX.
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/planning/afp">Open AFP</Link>
            </Button>
          </DashboardPanel>

          <DashboardPanel title="Commitments" viewAllHref="/planning/afe" contentClassName="p-4">
            <p className="text-sm text-muted-foreground">
              Review Band C/D authorizations after SPX validation. Approve or reject before work is issued.
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/planning/afe">Open commitments</Link>
            </Button>
          </DashboardPanel>

          <DashboardPanel title="Core Operations" viewAllHref="/operations/interventions" contentClassName="p-4">
            <p className="text-sm text-muted-foreground">
              Submit interventions or multi-week projects outside the annual block plan for SPX to commit in ETB.
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/operations/interventions">Open core operations</Link>
            </Button>
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <ActionQueueCard title="Silva approval queue" />

          <DashboardPanel title="Settlements">
            <div className="p-4 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Authorize and track owner settlements.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/payments/settlements">Open settlements</Link>
              </Button>
            </div>
          </DashboardPanel>

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

      <CropfortDashboardSection />
    </div>
  );
}
