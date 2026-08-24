"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type KpiTone = "primary" | "blue" | "amber" | "rose" | "slate";

const toneStyles: Record<KpiTone, { icon: string; ring: string }> = {
  primary: { icon: "bg-primary/10 text-primary", ring: "hover:ring-primary/20" },
  blue: { icon: "bg-sky-500/10 text-sky-700 dark:text-sky-400", ring: "hover:ring-sky-500/20" },
  amber: { icon: "bg-amber-500/10 text-amber-700 dark:text-amber-400", ring: "hover:ring-amber-500/20" },
  rose: { icon: "bg-rose-500/10 text-rose-700 dark:text-rose-400", ring: "hover:ring-rose-500/20" },
  slate: { icon: "bg-muted text-muted-foreground", ring: "hover:ring-border" },
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
    <Card
      className={cn(
        "kpi-card group relative overflow-hidden p-4 transition-all",
        href && "cursor-pointer hover:shadow-md hover:ring-2",
        href && styles.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
          )}
          {sublabel && !loading ? (
            <p className="mt-1 text-xs text-muted-foreground truncate">{sublabel}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {inner}
      </Link>
    );
  }

  return inner;
}
