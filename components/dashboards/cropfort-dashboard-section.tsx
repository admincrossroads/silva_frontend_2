"use client";

import { useCropfortDashboard } from "@/hooks/use-cropfort-dashboard";
import { DashboardPanel, DashboardPanelEmpty } from "@/components/dashboard/dashboard-panel";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Cropfort (ETB)</h2>
       
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Cropfort budget"
          value={totals ? formatEtb(totals.budgetEtb) : "—"}
          sublabel={`Plan year ${year}`}
          icon={Wallet}
          tone="primary"
          loading={isLoading}
          href="/planning/afp-blocks"
        />
        <KpiStatCard
          label="Released actual"
          value={totals ? formatEtb(totals.actualEtb) : "—"}
          sublabel="From released tickets"
          icon={Coins}
          tone="primary"
          loading={isLoading}
          href="/execution/weekly-entry"
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
              ? `Balance ${formatEtb(data.opexReserve.reserveBalanceEtb)}`
              : "Balance not configured"
          }
          icon={Wallet}
          tone={opexTone(data?.opexReserve.status ?? "unknown")}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardPanel title="Budget vs actual (block & activity)" viewAllHref="/planning/afp-blocks">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Block</th>
                  <th className="px-3 py-2 font-medium">Activity</th>
                  <th className="px-3 py-2 font-medium text-right">Budget</th>
                  <th className="px-3 py-2 font-medium text-right">Actual</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : !data?.bva.rows.length ? (
                  <tr>
                    <td colSpan={4}>
                      <DashboardPanelEmpty message="No Cropfort BvA rows yet" />
                    </td>
                  </tr>
                ) : (
                  data.bva.rows.slice(0, 8).map((row) => (
                    <tr key={`${row.blockId}-${row.activityId}`} className="border-b last:border-0">
                      <td className="px-3 py-2">{row.blockCode}</td>
                      <td className="px-3 py-2">{row.activityName}</td>
                      <td className="px-3 py-2 text-right">{formatEtb(row.budgetEtb)}</td>
                      <td className="px-3 py-2 text-right">{formatEtb(row.actualEtb)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Weekly rollup" viewAllHref="/validation/queue">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Week ending</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Total ETB</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : !data?.weeklyRollup.length ? (
                  <tr>
                    <td colSpan={3}>
                      <DashboardPanelEmpty message="No weekly submissions yet" />
                    </td>
                  </tr>
                ) : (
                  data.weeklyRollup.slice(0, 8).map((week) => (
                    <tr key={week.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{week.weekEnding.slice(0, 10)}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="capitalize">
                          {week.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">{formatEtb(week.totalEtb)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}
