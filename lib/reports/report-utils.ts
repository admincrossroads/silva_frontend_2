import type { BudgetVsActualRow, Report, ReportSection } from "@/types";

export const PERIOD_REPORT_CONFIG = {
  weekly: {
    title: "Weekly Progress",
    subtitle: "Field execution and cost snapshot by week",
    generateLabel: "Generate weekly draft",
  },
  monthly: {
    title: "Monthly Cost & Progress",
    subtitle: "Budget utilization, commitments, and SPX narrative for asset owners",
    generateLabel: "Generate monthly draft",
  },
  quarterly: {
    title: "Quarterly Governance Pack",
    subtitle: "Enhanced governance period summary for Silva review",
    generateLabel: "Generate quarterly draft",
  },
  annual: {
    title: "Annual Performance Report",
    subtitle: "Full-year budget, execution, and settlement outcomes",
    generateLabel: "Generate annual draft",
  },
} as const;

export type PeriodReportType = keyof typeof PERIOD_REPORT_CONFIG;

/** Map legacy *Usd snapshot fields to ETB names used by the UI. */
export function normalizeBvaRow(row: Record<string, unknown>): BudgetVsActualRow | null {
  if (!row || typeof row !== "object") return null;
  const budgetRaw = (row.budgetAllocatedEtb ?? row.budgetAllocatedUsd) as number | null | undefined;
  const plannedRaw = (row.plannedEtb ?? row.plannedUsd) as number | null | undefined;
  const committedRaw = (row.committedEtb ?? row.committedUsd ?? 0) as number;
  const actualRaw = (row.actualEtb ?? row.actualUsd ?? 0) as number;
  const budget = budgetRaw != null ? Number(budgetRaw) : 0;
  const actual = Number(actualRaw) || 0;
  const utilization =
    row.utilizationPercent != null
      ? Number(row.utilizationPercent)
      : budget
        ? Math.round((actual / budget) * 100)
        : 0;
  return {
    afpLineId: String(row.afpLineId ?? ""),
    activity: String(row.activity ?? ""),
    budgetAllocatedEtb: budgetRaw != null ? Number(budgetRaw) : 0,
    plannedEtb: plannedRaw != null ? Number(plannedRaw) : budgetRaw != null ? Number(budgetRaw) : 0,
    committedEtb: Number(committedRaw) || 0,
    actualEtb: Number(actualRaw) || 0,
    utilizationPercent: utilization,
    health: String(row.health ?? "on_track"),
  };
}

export function getReportBvaRows(report: Report): BudgetVsActualRow[] {
  const section = report.sections?.find((s) => s.key === "budget_vs_actual");
  if (!section || !Array.isArray(section.payload)) return [];
  return section.payload
    .map((row) => normalizeBvaRow(row as Record<string, unknown>))
    .filter((row): row is BudgetVsActualRow => row != null);
}

export function formatReportPeriod(period: string, type: string) {
  if (type === "weekly" && period.includes("-W")) return period.replace("-", " · Week ");
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return period;
}

export function summarizeBva(rows: BudgetVsActualRow[]) {
  if (!rows.length) return null;
  const budget = rows.reduce((s, r) => s + (r.budgetAllocatedEtb ?? 0), 0);
  const actual = rows.reduce((s, r) => s + (r.actualEtb ?? 0), 0);
  const committed = rows.reduce((s, r) => s + (r.committedEtb ?? 0), 0);
  const utilization = budget ? Math.round((actual / budget) * 100) : 0;
  return { budget, actual, committed, utilization, lineCount: rows.length };
}

export function sectionTitle(section: ReportSection) {
  return section.title.replace(/\b\w/g, (c) => c.toUpperCase());
}
