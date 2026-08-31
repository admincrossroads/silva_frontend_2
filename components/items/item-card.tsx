"use client";

import Link from "next/link";
import { formatWorkflowLabel } from "@/lib/config/procore-modules";
import { boardColumnTheme, ITEM_TYPE_LABELS } from "@/lib/items/board-theme";
import { StatusBadge } from "@/components/badges/status-badge";
import { BandBadge } from "@/components/badges/band-badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BoardItem } from "./types";

type ItemCardProps = {
  item: BoardItem;
  className?: string;
  /** Drag overlay / compact mode */
  compact?: boolean;
};

export function ItemCard({ item, className, compact }: ItemCardProps) {
  const theme = boardColumnTheme(item.status);
  const typeLabel = ITEM_TYPE_LABELS[item.type] ?? item.type;

  return (
    <Link href={item.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card
        className={cn(
          "group relative overflow-hidden border-border/70 bg-card/95 p-0 shadow-sm transition-all",
          "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
          "border-l-[3px]",
          theme.cardAccent,
          className,
        )}
      >
        <div className="p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {typeLabel}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h4 className="mt-2.5 text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary">
            {item.title}
          </h4>

          {item.subtitle ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{item.subtitle}</p>
          ) : null}

          {item.badge ? (
            <div className="mt-2.5">
              <BandBadge band={item.badge} />
            </div>
          ) : null}

          {item.meta?.length ? (
            <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-lg bg-muted/35 px-2.5 py-2">
              {item.meta.slice(0, compact ? 2 : 3).map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                  <dd className="truncate text-xs font-semibold tabular-nums text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {item.updatedAt && !compact ? (
            <p className="mt-2.5 text-[10px] text-muted-foreground">
              Updated {new Date(item.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return <div className="h-36 animate-pulse rounded-xl bg-muted/70" />;
}

export { formatWorkflowLabel };
