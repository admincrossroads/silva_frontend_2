"use client";

import Link from "next/link";
import { formatWorkflowLabel } from "@/lib/config/procore-modules";
import { StatusBadge } from "@/components/badges/status-badge";
import { BandBadge } from "@/components/badges/band-badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BoardItem } from "./types";

type ItemCardProps = {
  item: BoardItem;
  className?: string;
};

export function ItemCard({ item, className }: ItemCardProps) {
  return (
    <Link href={item.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <Card
        className={cn(
          "item-card p-3 shadow-sm transition-all hover:border-primary/35 hover:shadow-md",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{item.id.slice(0, 12)}</span>
          <StatusBadge status={item.status} />
        </div>
        <h4 className="mt-2 text-sm font-semibold leading-snug text-foreground line-clamp-2">{item.title}</h4>
        {item.subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.subtitle}</p>
        ) : null}
        {item.badge ? (
          <div className="mt-2">
            <BandBadge band={item.badge} />
          </div>
        ) : null}
        {item.meta?.length ? (
          <dl className="mt-3 space-y-1 border-t pt-2">
            {item.meta.slice(0, 2).map((row) => (
              <div key={row.label} className="flex justify-between gap-2 text-[11px]">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium text-foreground truncate">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {item.updatedAt ? (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Updated {new Date(item.updatedAt).toLocaleDateString()}
          </p>
        ) : null}
      </Card>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return <div className="h-32 animate-pulse rounded-lg bg-muted" />;
}

export { formatWorkflowLabel };
