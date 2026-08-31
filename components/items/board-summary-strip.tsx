"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BoardSummaryStat = {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "amber" | "emerald";
};

type BoardSummaryStripProps = {
  stats: BoardSummaryStat[];
  className?: string;
};

const TONE_STYLES = {
  default: "bg-card border-border/80",
  primary: "bg-primary/5 border-primary/15",
  amber: "bg-amber-500/5 border-amber-500/15",
  emerald: "bg-emerald-500/5 border-emerald-500/15",
};

const ICON_TONE = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export function BoardSummaryStrip({ stats, className }: BoardSummaryStripProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const tone = stat.tone ?? "default";
        return (
          <div
            key={stat.label}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-sm transition-colors",
              TONE_STYLES[tone],
            )}
          >
            {Icon ? (
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", ICON_TONE[tone])}>
                <Icon className="h-4 w-4" />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-foreground">{stat.value}</p>
              {stat.sublabel ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.sublabel}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
