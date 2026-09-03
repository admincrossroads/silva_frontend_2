"use client";

import { useCropfortDashboard } from "@/hooks/use-cropfort-dashboard";
import { DashboardPanel, DashboardPanelEmpty } from "@/components/dashboard/dashboard-panel";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableHead,
  DashboardTableRow,
  DashboardTableTd,
  DashboardTableTh,
} from "@/components/dashboard/dashboard-table";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Coins, TrendingUp, Wallet } from "lucide-react";

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(
    value,
  );
}

function opexTone(status: string): "primary" | "amber" | "rose" | "slate" {
  if (status === "adequate") return "primary";
  if (status === "warning") return "amber";
  if (status === "critical") return "rose";
  return "slate";
}

export function CropfortDashboardSection() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading, isError } = useCropfortDashboard({ planYear: year });

  if (isError) return null;

  const totals = data?.bva.totals;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Cropfort (ETB)</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Budget"
          value={totals ? formatEtb(totals.budgetEtb) : "—"}
          sublabel={String(year)}
          icon={Wallet}
          tone="primary"
          loading={isLoading}
          href="/operations/interventions?tab=block-afp"
        />
        <KpiStatCard
          label="Actual"
          value={totals ? formatEtb(totals.actualEtb) : "—"}
          icon={Coins}
          tone="primary"
          loading={isLoading}
          href="/operations/interventions?tab=weekly-entry"
        />
        <KpiStatCard
          label="Variance"
          value={totals ? `${totals.variancePct}%` : "—"}
          sublabel={totals ? formatEtb(totals.varianceEtb) : undefined}
          icon={TrendingUp}
          tone={totals && Math.abs(totals.variancePct) > 20 ? "amber" : "slate"}
          loading={isLoading}
        />
        <KpiStatCard
          label="Opex reserve"
          value={data?.opexReserve.status ?? "—"}
          sublabel={
            data?.opexReserve.reserveBalanceEtb != null
              ? formatEtb(data.opexReserve.reserveBalanceEtb)
              : undefined
          }
          icon={Wallet}
          tone={opexTone(data?.opexReserve.status ?? "unknown")}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardPanel title="Budget vs actual" viewAllHref="/reports/budget-vs-actual">
          <DashboardTable>
            <DashboardTableHead>
              <DashboardTableTh>Block</DashboardTableTh>
              <DashboardTableTh>Activity</DashboardTableTh>
              <DashboardTableTh align="right">Budget</DashboardTableTh>
              <DashboardTableTh align="right">Actual</DashboardTableTh>
            </DashboardTableHead>
            <DashboardTableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : !data?.bva.rows.length ? (
                <tr>
                  <td colSpan={4}>
                    <DashboardPanelEmpty message="No rows yet" />
                  </td>
                </tr>
              ) : (
                data.bva.rows.slice(0, 8).map((row, index) => (
                  <DashboardTableRow key={`${row.blockId}-${row.activityId}`} index={index}>
                    <DashboardTableTd className="font-medium">{row.blockCode}</DashboardTableTd>
                    <DashboardTableTd className="max-w-[12rem] truncate text-muted-foreground">
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

        <DashboardPanel title="Weekly rollup" viewAllHref="/dashboard#cropfort-validation">
          <DashboardTable>
            <DashboardTableHead>
              <DashboardTableTh>Week ending</DashboardTableTh>
              <DashboardTableTh>Status</DashboardTableTh>
              <DashboardTableTh align="right">Total ETB</DashboardTableTh>
            </DashboardTableHead>
            <DashboardTableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : !data?.weeklyRollup.length ? (
                <tr>
                  <td colSpan={3}>
                    <DashboardPanelEmpty message="No submissions yet" />
                  </td>
                </tr>
              ) : (
                data.weeklyRollup.slice(0, 8).map((week, index) => (
                  <DashboardTableRow key={week.id} index={index}>
                    <DashboardTableTd>{week.weekEnding.slice(0, 10)}</DashboardTableTd>
                    <DashboardTableTd>
                      <StatusBadge status={week.status} />
                    </DashboardTableTd>
                    <DashboardTableTd align="right">{formatEtb(week.totalEtb)}</DashboardTableTd>
                  </DashboardTableRow>
                ))
              )}
            </DashboardTableBody>
          </DashboardTable>
        </DashboardPanel>
      </div>
    </div>
  );
}
