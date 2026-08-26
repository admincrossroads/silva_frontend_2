"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { dashboardApi } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { BAND_COLORS } from "@/lib/utils/constants";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { HealthBadge } from "@/components/badges/health-badge";
import { EstateMapHero } from "@/components/dashboards/estate-map-hero";
import { BudgetUtilizationPanel } from "@/components/dashboards/budget-utilization-panel";
import { Button } from "@/components/ui/button";
import { FileCheck, TrendingUp, FileText, Wheat } from "lucide-react";

export function SilvaDashboard() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "silva-owner", year],
    queryFn: () => dashboardApi.silvaOwner(year),
  });

  const pending = data?.afePipeline?.pendingSilvaApprovalCount ?? 0;
  const watchLines =
    data?.budgetVsActual?.lines?.filter(
      (l: { health?: string }) => l.health === "watch" || l.health === "over_budget",
    ).length ?? 0;
  const released = data?.reports?.releasedCount ?? 0;

  return (
    <div className="space-y-6">
      <EstateMapHero map={data?.estateMap} />

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
          label="Budget watch"
          value={String(watchLines)}
          sublabel="AFP lines at risk"
          icon={TrendingUp}
          tone={watchLines > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/reports/budget-vs-actual"
        />
        <KpiStatCard
          label="Released reports"
          value={String(released)}
          sublabel="SPX authored"
          icon={FileText}
          tone="primary"
          loading={isLoading}
          href="/reports/monthly"
        />
        <KpiStatCard
          label="Picker productivity"
          value={String(data?.harvestKpis?.pickerProductivityCurrent ?? "—")}
          sublabel="kg/day current"
          icon={Wheat}
          tone="blue"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BudgetUtilizationPanel
            lines={data?.budgetVsActual?.lines}
            loading={isLoading}
            year={year}
          />
        </div>

        <DashboardPanel title="Released reports">
          <div className="flex flex-col gap-3 p-4">
            <p className="text-sm text-muted-foreground">
              Monthly ready: {data?.reports?.monthlyReady ? "Yes" : "No"}
              <br />
              Yield vs baseline: {data?.harvestKpis?.yieldTrendVsBaselinePercent ?? 0}%
            </p>
            <Button variant="outline" size="sm" asChild className="w-fit">
              <Link href="/reports/monthly">Open reports</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="w-fit px-0">
              <Link href="/planning/requests">My activity requests →</Link>
            </Button>
          </div>
        </DashboardPanel>
      </div>

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
                <span className="font-mono font-medium tabular-nums">
                  {formatCurrency(afe.estimatedCostUsd)}
                </span>
              </DashboardPanelRow>
            ),
          )
        ) : (
          <DashboardPanelEmpty message="No AFEs pending approval" />
        )}
      </DashboardPanel>
    </div>
  );
}
