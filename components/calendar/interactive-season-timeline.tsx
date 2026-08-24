"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  SEASON_STATUS_COLORS,
  SEASON_WEEKS,
  isWindowEditable,
  weekFromRatio,
  type SeasonWindowTimeline,
} from "./season-calendar-types";

type DragMode = "move" | "resize-start" | "resize-end" | "range";

type DragState = {
  mode: DragMode;
  windowId?: string;
  anchorWeek: number;
  initialStart: number;
  initialEnd: number;
  pointerId: number;
  rangeStart?: number;
  rangeEnd?: number;
};

type InteractiveSeasonTimelineProps = {
  windows: SeasonWindowTimeline[];
  selectedWindowId?: string | null;
  onSelectWindow?: (id: string | null) => void;
  onWindowChange?: (id: string, weekStart: number, weekEnd: number) => void;
  onRangeSelect?: (weekStart: number, weekEnd: number) => void;
  onWindowOpen?: (window: SeasonWindowTimeline) => void;
  editable?: boolean;
  className?: string;
};

function weekPosition(week: number) {
  return ((week - 1) / SEASON_WEEKS) * 100;
}

function weekWidth(start: number, end: number) {
  return ((end - start + 1) / SEASON_WEEKS) * 100;
}

export function InteractiveSeasonTimeline({
  windows,
  selectedWindowId,
  onSelectWindow,
  onWindowChange,
  onRangeSelect,
  onWindowOpen,
  editable = false,
  className,
}: InteractiveSeasonTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverWeek, setHoverWeek] = useState<number | null>(null);
  const [rangePreview, setRangePreview] = useState<{ weekStart: number; weekEnd: number } | null>(null);
  const [dragPreview, setDragPreview] = useState<Record<string, { weekStart: number; weekEnd: number }>>({});
  const dragRef = useRef<DragState | null>(null);
  const dragPreviewRef = useRef(dragPreview);
  dragPreviewRef.current = dragPreview;
  const didDragRef = useRef(false);

  const getRatioFromEvent = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return (clientX - rect.left) / rect.width;
  }, []);

  const getWindowRange = useCallback(
    (win: SeasonWindowTimeline) => dragPreview[win.id] ?? { weekStart: win.weekStart, weekEnd: win.weekEnd },
    [dragPreview],
  );

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    setRangePreview(null);

    if (!drag) {
      setDragPreview({});
      return;
    }

    if (drag.mode !== "range") didDragRef.current = true;

    if (drag.mode === "range" && drag.rangeStart != null && drag.rangeEnd != null && onRangeSelect) {
      const weekStart = Math.min(drag.rangeStart, drag.rangeEnd);
      const weekEnd = Math.max(drag.rangeStart, drag.rangeEnd);
      onRangeSelect(weekStart, weekEnd);
      setDragPreview({});
      return;
    }

    if (drag.windowId && onWindowChange) {
      const preview = dragPreviewRef.current[drag.windowId];
      if (preview && (preview.weekStart !== drag.initialStart || preview.weekEnd !== drag.initialEnd)) {
        onWindowChange(drag.windowId, preview.weekStart, preview.weekEnd);
      }
    }
    setDragPreview({});
  }, [onRangeSelect, onWindowChange]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const week = weekFromRatio(getRatioFromEvent(e.clientX));

      if (drag.mode === "range") {
        const start = Math.min(drag.anchorWeek, week);
        const end = Math.max(drag.anchorWeek, week);
        if (start !== end) didDragRef.current = true;
        drag.rangeStart = start;
        drag.rangeEnd = end;
        setRangePreview({ weekStart: start, weekEnd: end });
        return;
      }

      didDragRef.current = true;

      if (!drag.windowId) return;
      const duration = drag.initialEnd - drag.initialStart;

      if (drag.mode === "move") {
        let nextStart = week - (drag.anchorWeek - drag.initialStart);
        nextStart = Math.max(1, Math.min(SEASON_WEEKS - duration, nextStart));
        setDragPreview((prev) => ({
          ...prev,
          [drag.windowId!]: { weekStart: nextStart, weekEnd: nextStart + duration },
        }));
      } else if (drag.mode === "resize-start") {
        const nextStart = Math.max(1, Math.min(week, drag.initialEnd));
        setDragPreview((prev) => ({
          ...prev,
          [drag.windowId!]: { weekStart: nextStart, weekEnd: drag.initialEnd },
        }));
      } else if (drag.mode === "resize-end") {
        const nextEnd = Math.min(SEASON_WEEKS, Math.max(week, drag.initialStart));
        setDragPreview((prev) => ({
          ...prev,
          [drag.windowId!]: { weekStart: drag.initialStart, weekEnd: nextEnd },
        }));
      }
    };

    const onUp = (e: PointerEvent) => {
      if (dragRef.current?.pointerId === e.pointerId) finishDrag();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [finishDrag, getRatioFromEvent]);

  const startRangeSelect = (e: React.PointerEvent) => {
    if (!editable || !onRangeSelect) return;
    e.preventDefault();
    const ratio = getRatioFromEvent(e.clientX);
    const week = weekFromRatio(ratio);
    dragRef.current = {
      mode: "range",
      anchorWeek: week,
      initialStart: week,
      initialEnd: week,
      pointerId: e.pointerId,
      rangeStart: week,
      rangeEnd: week,
    };
    didDragRef.current = false;
    setRangePreview({ weekStart: week, weekEnd: week });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const startWindowDrag = (
    e: React.PointerEvent,
    win: SeasonWindowTimeline,
    mode: "move" | "resize-start" | "resize-end",
  ) => {
    if (!editable || !isWindowEditable(win.status)) return;
    e.stopPropagation();
    e.preventDefault();
    const week = weekFromRatio(getRatioFromEvent(e.clientX));
    dragRef.current = {
      mode,
      windowId: win.id,
      anchorWeek: week,
      initialStart: win.weekStart,
      initialEnd: win.weekEnd,
      pointerId: e.pointerId,
    };
    didDragRef.current = false;
    setDragPreview({ [win.id]: { weekStart: win.weekStart, weekEnd: win.weekEnd } });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const weeks = Array.from({ length: SEASON_WEEKS }, (_, i) => i + 1);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {editable
            ? "Drag on the week row to add a window · drag bars to move · drag edges to resize · click a bar to select"
            : "Click a bar to highlight · hover for details"}
        </span>
        {hoverWeek ? <span className="tabular-nums">Week {hoverWeek}</span> : null}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-muted/10 p-2 sm:p-3">
        <div ref={trackRef} className="min-w-[640px] select-none space-y-1 sm:min-w-[800px] lg:min-w-[960px]">
          {/* Week header — range selection target */}
          <div
            className={cn(
              "relative grid h-7 gap-px rounded-md",
              editable && onRangeSelect && "cursor-crosshair",
            )}
            style={{ gridTemplateColumns: `repeat(${SEASON_WEEKS}, minmax(0, 1fr))` }}
            onPointerDown={startRangeSelect}
            onPointerMove={(e) => {
              if (dragRef.current) return;
              setHoverWeek(weekFromRatio(getRatioFromEvent(e.clientX)));
            }}
            onPointerLeave={() => {
              if (!dragRef.current) setHoverWeek(null);
            }}
          >
            {weeks.map((w) => (
              <div
                key={w}
                className={cn(
                  "flex items-end justify-center pb-0.5 text-[9px] text-muted-foreground transition-colors",
                  hoverWeek === w && "bg-primary/10 text-primary",
                  rangePreview &&
                    w >= rangePreview.weekStart &&
                    w <= rangePreview.weekEnd &&
                    "bg-primary/20 text-primary",
                )}
              >
                {w % 4 === 1 ? w : ""}
              </div>
            ))}
            {rangePreview ? (
              <div
                className="pointer-events-none absolute inset-y-0 rounded-sm border-2 border-dashed border-primary/60 bg-primary/10"
                style={{
                  left: `${weekPosition(rangePreview.weekStart)}%`,
                  width: `${weekWidth(rangePreview.weekStart, rangePreview.weekEnd)}%`,
                }}
              />
            ) : null}
          </div>

          {/* Window rows */}
          {windows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {editable ? "Drag across the week row above to add your first window." : "No windows on this calendar."}
            </p>
          ) : (
            windows.map((win) => {
              const range = getWindowRange(win);
              const selected = selectedWindowId === win.id;
              const canEdit = editable && isWindowEditable(win.status);

              return (
                <div
                  key={win.id}
                  className="relative h-11 rounded-md bg-muted/30"
                  onPointerMove={(e) => {
                    if (dragRef.current) return;
                    setHoverWeek(weekFromRatio(getRatioFromEvent(e.clientX)));
                  }}
                >
                  {/* Hover column highlight */}
                  {hoverWeek && !dragRef.current ? (
                    <div
                      className="pointer-events-none absolute inset-y-0 bg-primary/5"
                      style={{
                        left: `${weekPosition(hoverWeek)}%`,
                        width: `${100 / SEASON_WEEKS}%`,
                      }}
                    />
                  ) : null}

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (didDragRef.current) {
                        didDragRef.current = false;
                        return;
                      }
                      onSelectWindow?.(win.id);
                    }}
                    onDoubleClick={() => onWindowOpen?.(win)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectWindow?.(win.id);
                      }
                    }}
                    title={`${win.activity} · W${range.weekStart}–${range.weekEnd} · ${win.status.replace(/_/g, " ")}`}
                    className={cn(
                      "absolute top-1 bottom-1 flex items-center overflow-hidden rounded-md border px-2 text-[10px] font-medium truncate transition-shadow",
                      SEASON_STATUS_COLORS[win.status] || SEASON_STATUS_COLORS.planned,
                      selected && "ring-2 ring-primary ring-offset-1 z-10",
                      canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    )}
                    style={{
                      left: `${weekPosition(range.weekStart)}%`,
                      width: `${weekWidth(range.weekStart, range.weekEnd)}%`,
                    }}
                    onPointerDown={(e) => startWindowDrag(e, win, "move")}
                  >
                    {canEdit ? (
                      <>
                        <span
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10"
                          onPointerDown={(e) => startWindowDrag(e, win, "resize-start")}
                        />
                        <span
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10"
                          onPointerDown={(e) => startWindowDrag(e, win, "resize-end")}
                        />
                      </>
                    ) : null}
                    <span className="relative z-[1] truncate">{win.activity}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedWindowId ? (
        <SelectedWindowPanel
          window={windows.find((w) => w.id === selectedWindowId) ?? null}
          onClear={() => onSelectWindow?.(null)}
          onOpen={onWindowOpen}
        />
      ) : null}
    </div>
  );
}

function SelectedWindowPanel({
  window: win,
  onClear,
  onOpen,
}: {
  window: SeasonWindowTimeline | null;
  onClear: () => void;
  onOpen?: (window: SeasonWindowTimeline) => void;
}) {
  if (!win) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium truncate">{win.activity}</p>
        <p className="text-xs text-muted-foreground">
          {win.operatingDiscipline} · W{win.weekStart}–{win.weekEnd}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={win.status} />
        {win.linkedWorkOrderId ? (
          <Link
            href={`/execution/work-orders/${win.linkedWorkOrderId}`}
            className="text-xs text-primary hover:underline"
          >
            {win.linkedWorkOrderId}
          </Link>
        ) : null}
        {onOpen && isWindowEditable(win.status) ? (
          <button type="button" className="text-xs text-primary hover:underline" onClick={() => onOpen(win)}>
            Edit
          </button>
        ) : null}
        <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

export function SeasonStatusLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {(["planned", "issued", "in_progress", "complete"] as const).map((status) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-sm border", SEASON_STATUS_COLORS[status])} />
          {status.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}
