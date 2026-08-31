"use client";

import { cn } from "@/lib/utils";

type StatItem = {
  label: string;
  value: string;
};

export function DashboardStatGrid({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-px bg-border/80 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
