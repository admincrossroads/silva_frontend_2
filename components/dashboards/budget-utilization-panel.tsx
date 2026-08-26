"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardPanel, DashboardPanelEmpty } from "@/components/dashboard/dashboard-panel";
import { formatCurrency } from "@/lib/utils/format";

export type BudgetUtilizationLine = {
  afpLineId: string;
  activity?: string;
  operatingDiscipline?: string;
  budgetAllocatedUsd?: number;
  committedUsd?: number;
  utilizationPercent: number;
  health: string;
};

function shortLabel(line: BudgetUtilizationLine) {
  const raw = line.activity || line.operatingDiscipline || line.afpLineId;
  return raw.length > 18 ? `${raw.slice(0, 16)}…` : raw;
}

function healthFill(health: string) {
  if (health === "over_budget") return "#e11d48";
  if (health === "watch") return "#f59e0b";
  return "#059669";
}

export function BudgetUtilizationPanel({
  lines,
  loading,
  year,
}: {
  lines: BudgetUtilizationLine[] | undefined;
  loading?: boolean;
  year: number;
}) {
  const chartData = useMemo(() => {
    return [...(lines ?? [])]
      .sort((a, b) => (b.budgetAllocatedUsd ?? 0) - (a.budgetAllocatedUsd ?? 0))
      .slice(0, 8)
      .map((line) => ({
        name: shortLabel(line),
        fullName: line.activity || line.afpLineId,
        budget: Number(line.budgetAllocatedUsd ?? 0),
        committed: Number(line.committedUsd ?? 0),
        utilization: line.utilizationPercent,
        health: line.health,
      }));
  }, [lines]);

  const avg =
    chartData.length > 0
      ? Math.round(chartData.reduce((s, r) => s + r.utilization, 0) / chartData.length)
      : 0;

  return (
    <DashboardPanel
      title="Budget utilization"
      viewAllHref="/reports/budget-vs-actual"
      viewAllLabel="Full BvA"
      noPadding
    >
      {loading ? (
        <DashboardPanelEmpty message="Loading utilization…" />
      ) : chartData.length === 0 ? (
        <DashboardPanelEmpty message={`No AFP budget lines for ${year}.`} />
      ) : (
        <div className="space-y-3 p-4 pt-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Avg utilization
              </p>
              <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums tracking-tight">
                {avg}
                <span className="ml-1 text-sm font-medium text-muted-foreground">%</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Budget vs committed · {year}
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2} barCategoryGap="18%" margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={chartData.length > 5 ? -18 : 0}
                  textAnchor={chartData.length > 5 ? "end" : "middle"}
                  height={chartData.length > 5 ? 48 : 28}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                  width={44}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.45)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.06)",
                    fontSize: 12,
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  formatter={(value: number, key: string, item) => {
                    if (key === "budget") return [formatCurrency(value), "Budget"];
                    if (key === "committed") {
                      const util = item?.payload?.utilization;
                      return [formatCurrency(value), `Committed (${util}%)`];
                    }
                    return [value, key];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                  formatter={(value) => (value === "budget" ? "Budget" : "Committed")}
                />
                <Bar dataKey="budget" name="budget" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={36} />
                <Bar dataKey="committed" name="committed" radius={[3, 3, 0, 0]} maxBarSize={36}>
                  {chartData.map((row) => (
                    <Cell key={row.name} fill={healthFill(row.health)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
