"use client";

import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { boardColumnTheme } from "@/lib/items/board-theme";
import { cn } from "@/lib/utils";

type BoardColumnShellProps = {
  status: string;
  count: number;
  summary?: string;
  isOver?: boolean;
  droppableRef?: (node: HTMLElement | null) => void;
  children: ReactNode;
  className?: string;
};

export function BoardColumnShell({
  status,
  count,
  summary,
  isOver,
  droppableRef,
  children,
  className,
}: BoardColumnShellProps) {
  const theme = boardColumnTheme(status);

  return (
    <div
      ref={droppableRef}
      className={cn(
        "flex min-w-[18.5rem] max-w-[22rem] flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow",
        theme.column,
        isOver && "ring-2 ring-primary/45 shadow-md",
        className,
      )}
    >
      <div className={cn("relative border-b px-3.5 py-3", theme.header)}>
        <div className={cn("absolute inset-x-0 top-0 h-0.5", theme.dot)} />
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", theme.dot)} />
              <h3 className="truncate text-sm font-semibold text-foreground">{theme.label}</h3>
            </div>
            {theme.hint ? (
              <p className="mt-0.5 pl-4 text-[11px] text-muted-foreground">{theme.hint}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums",
              theme.header,
              "ring-1 ring-border/50",
            )}
          >
            {count}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5 min-h-[10rem]">{children}</div>

      {summary ? (
        <div className="border-t border-border/60 bg-background/50 px-3.5 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Column total</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{summary}</p>
        </div>
      ) : null}
    </div>
  );
}

export function BoardColumnEmpty({ status }: { status: string }) {
  const theme = boardColumnTheme(status);
  const Icon = theme.icon;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-3 py-8 text-center",
        "border-border/60 bg-background/40",
      )}
    >
      <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-full", theme.header)}>
        <Icon className={cn("h-4 w-4", theme.empty)} />
      </div>
      <p className={cn("text-xs font-medium", theme.empty)}>No items</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/80">Drag cards here</p>
    </div>
  );
}

export function BoardLoadingSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="min-w-[18.5rem] flex-1 animate-pulse rounded-2xl border bg-muted/20 p-3 space-y-3"
        >
          <div className="h-10 rounded-lg bg-muted" />
          <div className="h-24 rounded-xl bg-muted/80" />
          <div className="h-24 rounded-xl bg-muted/80" />
        </div>
      ))}
    </div>
  );
}

export function BoardEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-gradient-to-b from-muted/30 to-muted/10 px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="text-sm font-medium text-foreground">Nothing on the board yet</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
