"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { FieldWorkCalendar } from "@/lib/api/cropfort/field-work-calendar";

function formatEtb(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  confirmed: "default",
  elective: "secondary",
  quoted: "outline",
};

export function ActivityReferenceTable({ calendar }: { calendar: FieldWorkCalendar }) {
  const rows = useMemo(
    () =>
      [...calendar.rows].sort(
        (a, b) =>
          a.tier.localeCompare(b.tier) ||
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          a.activityCode.localeCompare(b.activityCode),
      ),
    [calendar.rows],
  );

  return (
    <div className="overflow-auto rounded-md border max-h-[min(70vh,720px)]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background">
          <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2">Tier</th>
            <th className="px-3 py-2">Activity</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Commercial status</th>
            <th className="px-3 py-2 text-right">Annual fee</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                No activities yet. Seed the calendar from templates.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id || row.activityCode} className="border-b last:border-0 align-top">
                <td className="px-3 py-2 whitespace-nowrap">{row.tier}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{row.activityName}</div>
                  <div className="text-xs text-muted-foreground">{row.activityCode}</div>
                </td>
                <td className="px-3 py-2">{row.category}</td>
                <td className="px-3 py-2">
                  <Badge variant={STATUS_VARIANT[row.commercialStatus] || "outline"}>
                    {row.commercialStatus}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatEtb(row.annualFeeEtb)}</td>
                <td className="px-3 py-2 text-muted-foreground max-w-xs">{row.notes || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
