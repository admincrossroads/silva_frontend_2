"use client";

import { Fragment, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  FieldWorkCalendar,
  FieldWorkIntensity,
} from "@/lib/api/cropfort/field-work-calendar";
import { Button } from "@/components/ui/button";

const INTENSITY_CLASS: Record<FieldWorkIntensity, string> = {
  peak: "bg-amber-600 text-white",
  active: "bg-emerald-600/85 text-white",
  light: "bg-sky-500/70 text-white",
};

const INTENSITY_LETTER: Record<FieldWorkIntensity, string> = {
  peak: "P",
  active: "A",
  light: "L",
};

type Props = {
  calendar: FieldWorkCalendar;
};

export function IntensityGrid({ calendar }: Props) {
  const [year, setYear] = useState<1 | 2 | 3>(1);

  const months = useMemo(
    () => calendar.monthLabels.filter((m) => m.yearSlice === year),
    [calendar.monthLabels, year],
  );

  const gridRows = useMemo(() => {
    return calendar.rows
      .filter((r) => (r.cells?.length ?? 0) > 0)
      .sort((a, b) => a.tier.localeCompare(b.tier) || a.sortOrder! - b.sortOrder! || a.activityCode.localeCompare(b.activityCode));
  }, [calendar.rows]);

  const byTier = useMemo(() => {
    const map = new Map<string, typeof gridRows>();
    for (const row of gridRows) {
      const list = map.get(row.tier) || [];
      list.push(row);
      map.set(row.tier, list);
    }
    return Array.from(map.entries());
  }, [gridRows]);

  const cellMap = (rowId: string | undefined, code: string) => {
    const row = calendar.rows.find((r) => r.id === rowId || r.activityCode === code);
    const map = new Map<number, FieldWorkIntensity>();
    for (const c of row?.cells || []) map.set(c.monthIndex, c.intensity);
    return map;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {([1, 2, 3] as const).map((y) => (
            <Button
              key={y}
              size="sm"
              variant={year === y ? "default" : "outline"}
              onClick={() => setYear(y)}
            >
              Year {y}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold", INTENSITY_CLASS.peak)}>
              P
            </span>
            Peak
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold", INTENSITY_CLASS.active)}>
              A
            </span>
            Active
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold", INTENSITY_CLASS.light)}>
              L
            </span>
            Light
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-md border max-h-[min(70vh,720px)]">
        <table className="min-w-max border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-background">
            <tr>
              <th className="sticky left-0 z-30 min-w-[220px] border-b border-r bg-muted/60 px-2 py-2 text-left font-semibold">
                Activity
              </th>
              {months.map((m) => (
                <th
                  key={m.monthIndex}
                  className="border-b px-1 py-2 text-center font-medium text-muted-foreground min-w-[44px]"
                  title={m.monthLabel}
                >
                  <div>M{m.monthIndex}</div>
                  <div className="font-normal opacity-70">{m.monthLabel.slice(5)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byTier.length === 0 ? (
              <tr>
                <td colSpan={months.length + 1} className="px-3 py-6 text-muted-foreground">
                  No intensity rows. Seed from templates to populate the grid.
                </td>
              </tr>
            ) : (
              byTier.map(([tier, rows]) => (
                <Fragment key={`tier-${tier}`}>
                  <tr>
                    <td
                      colSpan={months.length + 1}
                      className="sticky left-0 bg-muted/40 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {tier}
                    </td>
                  </tr>
                  {rows.map((row) => {
                    const intensities = cellMap(row.id, row.activityCode);
                    return (
                      <tr key={row.id || row.activityCode} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="sticky left-0 z-10 border-r bg-background px-2 py-1.5">
                          <div className="font-medium leading-tight">{row.activityName}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {row.activityCode} · {row.category}
                          </div>
                        </td>
                        {months.map((m) => {
                          const intensity = intensities.get(m.monthIndex);
                          return (
                            <td key={m.monthIndex} className="px-0.5 py-0.5 text-center">
                              {intensity ? (
                                <span
                                  className={cn(
                                    "inline-flex h-7 w-8 items-center justify-center rounded text-[11px] font-bold",
                                    INTENSITY_CLASS[intensity],
                                  )}
                                  title={`${m.monthLabel}: ${intensity}`}
                                >
                                  {INTENSITY_LETTER[intensity]}
                                </span>
                              ) : (
                                <span className="inline-block h-7 w-8 text-muted-foreground/30">·</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
