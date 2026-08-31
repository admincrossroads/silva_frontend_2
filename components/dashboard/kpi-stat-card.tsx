"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiTone = "primary" | "blue" | "amber" | "rose" | "slate";

const toneStyles: Record<KpiTone, { icon: string; ring: string; card: string }> = {
  primary: {
    icon: "bg-primary/15 text-primary",
    ring: "hover:ring-primary/25",
    card: "border-primary/15 bg-primary/[0.04]",
  },
  blue: {
    icon: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    ring: "hover:ring-sky-500/25",
    card: "border-sky-500/15 bg-sky-500/[0.04]",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    ring: "hover:ring-amber-500/25",
    card: "border-amber-500/15 bg-amber-500/[0.04]",
  },
  rose: {
    icon: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    ring: "hover:ring-rose-500/25",
    card: "border-rose-500/15 bg-rose-500/[0.04]",
  },
  slate: {
    icon: "bg-muted text-muted-foreground",
    ring: "hover:ring-border",
    card: "border-border/80 bg-card",
  },
};

type KpiStatCardProps = {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: KpiTone;
  loading?: boolean;
  href?: string;
};

export function KpiStatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "primary",
  loading,
  href,
}: KpiStatCardProps) {
  const styles = toneStyles[tone];

  const inner = (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-sm transition-all",
        styles.card,
        href && "cursor-pointer hover:shadow-md hover:ring-2",
        href && styles.ring,
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", styles.icon)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-20 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
        )}
        {sublabel && !loading ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {inner}
      </Link>
    );
  }

  return inner;
}
