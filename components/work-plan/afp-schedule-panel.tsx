"use client";

import { useQuery } from "@tanstack/react-query";
import { afpScheduleApi } from "@/lib/api/work-plans";
import { Card } from "@/components/ui/card";

const MONTH_LABELS: Record<number, string> = {
  10: "Oct",
  11: "Nov",
  12: "Dec",
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
};

type AfpSchedulePanelProps = {
  afpLineId: string;
};

export function AfpSchedulePanel({ afpLineId }: AfpSchedulePanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["afp-schedule", afpLineId],
    queryFn: () => afpScheduleApi.get(afpLineId),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading monthly plan…</p>;
  }

  if (!data?.months.length) {
    return null;
  }

  const maxEtb = Math.max(...data.months.map((m) => m.plannedCostEtb), 1);

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Monthly burn plan (Oct–Sep)
      </h3>
      <div className="flex items-end gap-1 h-32">
        {data.months.map((m) => (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-primary/70 min-h-[4px]"
              style={{ height: `${Math.max(4, (m.plannedCostEtb / maxEtb) * 100)}%` }}
              title={`${m.plannedCostEtb.toLocaleString()} ETB`}
            />
            <span className="text-[10px] text-muted-foreground">{MONTH_LABELS[m.month]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Annual plan: {data.budgetAllocatedEtb?.toLocaleString() ?? "—"} ETB
      </p>
    </Card>
  );
}
