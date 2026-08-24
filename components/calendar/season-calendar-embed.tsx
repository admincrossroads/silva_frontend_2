"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { seasonCalendarApi } from "@/lib/api/field-ops";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  InteractiveSeasonTimeline,
  SeasonStatusLegend,
} from "@/components/calendar/interactive-season-timeline";

type SeasonWindow = {
  id: string;
  operatingDiscipline: string;
  activity: string;
  weekStart: number;
  weekEnd: number;
  status: string;
  linkedWorkOrderId: string | null;
};

type SeasonCalendar = {
  id: string;
  year: number;
  name: string;
  status: string;
  windows: SeasonWindow[];
};

/** Embedded season calendar for Schedule module — interactive read-only Gantt strip. */
export function SeasonCalendarEmbed({ year }: { year?: number }) {
  const y = year ?? new Date().getFullYear();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const { data: calendars = [], isLoading } = useQuery<SeasonCalendar[]>({
    queryKey: ["season-calendars", y],
    queryFn: () => seasonCalendarApi.findAll({ year: y }),
  });

  const selected = useMemo(() => {
    if (!calendars.length) return null;
    return calendars.find((c) => c.id === selectedId) || calendars[0];
  }, [calendars, selectedId]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading calendar…</p>;
  }

  if (!calendars.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        No season calendar for {y}.{" "}
        <Link href="/execution/calendar" className="text-primary hover:underline">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {calendars.map((cal) => (
            <button
              key={cal.id}
              type="button"
              onClick={() => {
                setSelectedId(cal.id);
                setSelectedWindowId(null);
              }}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                selected?.id === cal.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              {cal.name}
            </button>
          ))}
        </div>
        <Link href="/execution/calendar" className="text-xs text-primary hover:underline">
          Full calendar
        </Link>
      </div>

      {selected ? (
        <>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{selected.name}</p>
            <StatusBadge status={selected.status} />
          </div>
          <SeasonStatusLegend />
          <InteractiveSeasonTimeline
            windows={selected.windows || []}
            selectedWindowId={selectedWindowId}
            onSelectWindow={setSelectedWindowId}
            editable={false}
          />
        </>
      ) : null}
    </div>
  );
}
