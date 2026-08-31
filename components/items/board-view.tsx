"use client";

import type { ReactNode } from "react";
import { BoardColumnEmpty, BoardColumnShell, BoardEmptyState, BoardLoadingSkeleton } from "./board-column";
import { ItemCard } from "./item-card";
import type { BoardItem } from "./types";
import { cn } from "@/lib/utils";

type BoardViewProps = {
  columns: readonly string[];
  items: BoardItem[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  columnSummaries?: Record<string, string>;
};

export function BoardView({
  columns,
  items,
  loading,
  emptyMessage = "Create your first item or switch to table view to see all records.",
  className,
  columnSummaries,
}: BoardViewProps) {
  if (loading) {
    return <BoardLoadingSkeleton columns={columns.length || 4} />;
  }

  if (!items.length) {
    return <BoardEmptyState message={emptyMessage} />;
  }

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory", className)}>
      {columns.map((col) => {
        const colItems = items.filter((item) => item.status === col);
        return (
          <div key={col} className="snap-start">
            <BoardColumnShell status={col} count={colItems.length} summary={columnSummaries?.[col]}>
              {colItems.length ? (
                colItems.map((item) => <ItemCard key={item.id} item={item} />)
              ) : (
                <BoardColumnEmpty status={col} />
              )}
            </BoardColumnShell>
          </div>
        );
      })}
    </div>
  );
}

type StatusWorkflowProps = {
  states: readonly string[];
  current: string;
  className?: string;
};

/** Horizontal workflow stepper on detail pages */
export function StatusWorkflow({ states, current, className }: StatusWorkflowProps) {
  const currentIndex = states.indexOf(current);

  return (
    <ol className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {states.map((state, i) => {
        const done = i < currentIndex;
        const active = state === current;
        return (
          <li key={state} className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
                active && "bg-primary text-primary-foreground shadow-sm",
                done && !active && "bg-primary/12 text-primary",
                !done && !active && "bg-muted/80 text-muted-foreground",
              )}
            >
              {state
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </span>
            {i < states.length - 1 ? <span className="text-muted-foreground/35 text-xs">›</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function BoardTableShell({ toolbar, children }: { toolbar: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {toolbar}
      {children}
    </div>
  );
}
