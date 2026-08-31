"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function DashboardTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border/80 bg-muted/40">{children}</tr>
    </thead>
  );
}

export function DashboardTableTh({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

export function DashboardTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DashboardTableRow({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <tr
      className={cn(
        "border-b border-border/50 transition-colors last:border-0 hover:bg-primary/[0.04]",
        index % 2 === 0 ? "bg-background" : "bg-muted/15",
      )}
    >
      {children}
    </tr>
  );
}

export function DashboardTableTd({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-4 py-2.5 align-middle text-foreground",
        align === "right" ? "text-right tabular-nums" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}
