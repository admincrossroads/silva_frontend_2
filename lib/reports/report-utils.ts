import type { BudgetVsActualRow, Report, ReportSection } from "@/types";
import { downloadBlob } from "@/lib/api/exports";

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

export function getReportBvaRows(report: Report): BudgetVsActualRow[] {
  const section = report.sections?.find((s) => s.key === "budget_vs_actual");
  if (!section || !Array.isArray(section.payload)) return [];
  return section.payload as BudgetVsActualRow[];
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

export function downloadReportCsv(report: Report, rows: BudgetVsActualRow[]) {
  const header = "activity,budget_usd,planned_usd,committed_usd,actual_usd,utilization_percent,health";
  const lines = rows.map(
    (r) =>
      `"${r.activity.replace(/"/g, '""')}",${r.budgetAllocatedUsd},${r.plannedUsd ?? ""},${r.committedUsd},${r.actualUsd},${r.utilizationPercent},${r.health}`,
  );
  const narrative = report.narrative ? `\n\nNarrative\n"${report.narrative.replace(/"/g, '""')}"` : "";
  const csv = [`Report,${report.type}`, `Period,${report.period}`, `Status,${report.status}`, "", header, ...lines].join("\n") + narrative;
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `report-${report.type}-${report.period}.csv`);
}

export function summarizeBva(rows: BudgetVsActualRow[]) {
  if (!rows.length) return null;
  const budget = rows.reduce((s, r) => s + (r.budgetAllocatedUsd ?? 0), 0);
  const actual = rows.reduce((s, r) => s + (r.actualUsd ?? 0), 0);
  const committed = rows.reduce((s, r) => s + (r.committedUsd ?? 0), 0);
  const utilization = budget ? Math.round((actual / budget) * 100) : 0;
  return { budget, actual, committed, utilization, lineCount: rows.length };
}

export function sectionTitle(section: ReportSection) {
  return section.title.replace(/\b\w/g, (c) => c.toUpperCase());
}
