"use client";

import type { ReactNode } from "react";
import { formatWorkflowLabel } from "@/lib/config/procore-modules";
import { ItemCard, ItemCardSkeleton } from "./item-card";
import type { BoardItem } from "./types";
import { cn } from "@/lib/utils";

type BoardViewProps = {
  columns: readonly string[];
  items: BoardItem[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
};

export function BoardView({
  columns,
  items,
  loading,
  emptyMessage = "No items in this workflow.",
  className,
}: BoardViewProps) {
  if (loading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-3 xl:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const hasAny = items.length > 0;
  if (!hasAny) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
      {columns.map((col) => {
        const colItems = items.filter((item) => item.status === col);
        return (
          <div
            key={col}
            className="flex min-w-[17rem] max-w-[20rem] flex-1 flex-col rounded-xl border bg-muted/20"
          >
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {formatWorkflowLabel(col)}
              </h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {colItems.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2 min-h-[8rem]">
              {colItems.length ? (
                colItems.map((item) => <ItemCard key={item.id} item={item} />)
              ) : (
                <p className="px-2 py-6 text-center text-[11px] text-muted-foreground/80">Empty</p>
              )}
            </div>
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

/** Procore-style horizontal workflow stepper on detail pages */
export function StatusWorkflow({ states, current, className }: StatusWorkflowProps) {
  const currentIndex = states.indexOf(current);

  return (
    <ol className={cn("flex flex-wrap items-center gap-1", className)}>
      {states.map((state, i) => {
        const done = i < currentIndex;
        const active = state === current;
        return (
          <li key={state} className="flex items-center gap-1">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
                active && "bg-primary text-primary-foreground",
                done && !active && "bg-primary/15 text-primary",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {formatWorkflowLabel(state)}
            </span>
            {i < states.length - 1 ? (
              <span className="text-muted-foreground/40 text-xs">→</span>
            ) : null}
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
