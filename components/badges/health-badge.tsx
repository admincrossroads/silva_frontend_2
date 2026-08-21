"use client";

import { cn } from "@/lib/utils";

const HEALTH_STYLES: Record<string, string> = {
  on_track: "bg-primary/10 text-primary",
  watch: "bg-amber-50 text-amber-800 border-amber-200",
  over_budget: "bg-destructive/10 text-destructive",
  overdue: "bg-destructive/10 text-destructive",
};

const HEALTH_LABELS: Record<string, string> = {
  on_track: "On Track",
  watch: "Watch",
  over_budget: "Over Budget",
  overdue: "Overdue",
};

export function HealthBadge({ health }: { health?: string | null }) {
  if (!health) return null;
  const key = health in HEALTH_LABELS ? health : "watch";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium",
        HEALTH_STYLES[key] || HEALTH_STYLES.watch,
      )}
    >
      {HEALTH_LABELS[key] || health}
    </span>
  );
}
