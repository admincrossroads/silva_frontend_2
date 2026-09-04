"use client";

/**
 * Silva owner desk dashboard.
 * Previous cluttered layout preserved in `silva-dashboard.legacy.tsx`
 * (export `SilvaDashboardLegacy`) for revert.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableHead,
  DashboardTableRow,
  DashboardTableTd,
  DashboardTableTh,
} from "@/components/dashboard/dashboard-table";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { EstateMapHero } from "@/components/dashboards/estate-map-hero";
import { RateCardApprovalsPanel } from "@/components/cropfort/rate-card-approvals-panel";
import { AfpBlockApprovalsPanel } from "@/components/cropfort/afp-block-approvals-panel";
import { useCropfortDashboard } from "@/hooks/use-cropfort-dashboard";
import { useRateCardLines } from "@/hooks/use-rate-card";
import { useAfpBlockLines } from "@/hooks/use-afp-blocks";
import { Wallet, Coins, ListTodo, FileText, Users } from "lucide-react";

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SilvaDashboard() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "silva-owner", year],
    queryFn: () => dashboardApi.silvaOwner(year),
  });
  const { data: queue } = useQuery({
    queryKey: ["dashboard", "action-queues"],
    queryFn: () => dashboardApi.actionQueues(),
  });
  const { data: cropfort, isLoading: cropfortLoading } = useCropfortDashboard({ planYear: year });
  const { data: rateLines = [] } = useRateCardLines("submitted");
  const { data: planLines = [] } = useAfpBlockLines({ planYear: year, status: "submitted" });

  const totals = cropfort?.bva.totals;
  const waitingOnYou = useMemo(() => {
    const afeQueue = (queue?.items ?? []).length;
    return afeQueue + rateLines.length + planLines.length;
  }, [queue?.items, rateLines.length, planLines.length]);

  const monthlyReady = Boolean(data?.reports?.monthlyReady);
  const vendorAlerts = data?.vendorPerformance?.belowThresholdCount ?? 0;
  const reserveLabel =
    cropfort?.opexReserve.reserveBalanceEtb != null
      ? formatEtb(cropfort.opexReserve.reserveBalanceEtb)
      : undefined;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="h-[280px] animate-pulse rounded-2xl bg-muted/50" />
      ) : (
        <EstateMapHero map={data?.estateMap} />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Budget"
          value={totals ? formatEtb(totals.budgetEtb) : "—"}
          sublabel={reserveLabel ? `Reserve ${reserveLabel}` : String(year)}
          icon={Wallet}
          tone="primary"
          loading={cropfortLoading}
          href="/planning/afp"
        />
        <KpiStatCard
          label="Spent"
          value={totals ? formatEtb(totals.actualEtb) : "—"}
          sublabel={totals ? `${totals.variancePct}% vs plan` : undefined}
          icon={Coins}
          tone={totals && Math.abs(totals.variancePct) > 20 ? "amber" : "primary"}
          loading={cropfortLoading}
          href="/reports/budget-vs-actual"
        />
        <KpiStatCard
          label="Waiting on you"
          value={String(waitingOnYou)}
          sublabel="Approvals"
          icon={ListTodo}
          tone={waitingOnYou > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/planning/afe"
        />
        <KpiStatCard
          label="Monthly report"
          value={monthlyReady ? "Ready" : "Pending"}
          sublabel={String(year)}
          icon={FileText}
          tone={monthlyReady ? "primary" : "slate"}
          loading={isLoading}
          href="/reports/monthly"
        />
      </div>

      <DashboardPanel title="This year’s farm spend" viewAllHref="/planning/afp">
        <DashboardTable>
          <DashboardTableHead>
            <DashboardTableTh>Block</DashboardTableTh>
            <DashboardTableTh>Activity</DashboardTableTh>
            <DashboardTableTh align="right">Budget</DashboardTableTh>
            <DashboardTableTh align="right">Spent</DashboardTableTh>
          </DashboardTableHead>
          <DashboardTableBody>
            {cropfortLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : !cropfort?.bva.rows.length ? (
              <tr>
                <td colSpan={4}>
                  <DashboardPanelEmpty message="No spend rows yet for this year." />
                </td>
              </tr>
            ) : (
              cropfort.bva.rows.slice(0, 10).map((row, index) => (
                <DashboardTableRow key={`${row.blockId}-${row.activityId}`} index={index}>
                  <DashboardTableTd className="font-medium">{row.blockCode}</DashboardTableTd>
                  <DashboardTableTd className="max-w-[14rem] truncate text-muted-foreground">
                    {row.activityName}
                  </DashboardTableTd>
                  <DashboardTableTd align="right">{formatEtb(row.budgetEtb)}</DashboardTableTd>
                  <DashboardTableTd align="right">{formatEtb(row.actualEtb)}</DashboardTableTd>
                </DashboardTableRow>
              ))
            )}
          </DashboardTableBody>
        </DashboardTable>
      </DashboardPanel>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Needs your approval</h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ActionQueueCard
            title="Spend authorizations"
            emptyLabel="Nothing waiting — SPX will notify you."
          />
          <RateCardApprovalsPanel />
          <AfpBlockApprovalsPanel />
        </div>
      </div>

      <DashboardPanel title="More" noPadding contentClassName="divide-y">
        <DashboardPanelRow href="/payments/settlements">Settlements</DashboardPanelRow>
        <DashboardPanelRow href="/vendors">
          <span className="flex-1">Assigned partners</span>
          {vendorAlerts > 0 ? (
            <span className="flex items-center gap-1 text-xs text-rose-600">
              <Users className="h-3.5 w-3.5" />
              {vendorAlerts} alert{vendorAlerts !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">OK</span>
          )}
        </DashboardPanelRow>
        <DashboardPanelRow href="/operations/projects">New project request</DashboardPanelRow>
        <DashboardPanelRow href="/operations/interventions">New intervention request</DashboardPanelRow>
      </DashboardPanel>
    </div>
  );
}
