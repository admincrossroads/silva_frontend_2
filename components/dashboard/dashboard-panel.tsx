"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardPanelProps = {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
};

export function DashboardPanel({
  title,
  viewAllHref,
  viewAllLabel = "View all",
  children,
  className,
  contentClassName,
  noPadding,
}: DashboardPanelProps) {
  return (
    <Card className={cn("dashboard-panel overflow-hidden rounded-2xl border-border/80 shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/80 bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {viewAllHref ? (
          <Button variant="ghost" size="sm" className="h-8 shrink-0 gap-1 text-xs" asChild>
            <Link href={viewAllHref}>
              {viewAllLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : null}
      </div>
      <div className={cn(!noPadding && "p-0", contentClassName)}>{children}</div>
    </Card>
  );
}

export function DashboardPanelEmpty({ message }: { message: string }) {
  return <p className="px-4 py-8 text-center text-sm text-muted-foreground">{message}</p>;
}

export function DashboardPanelRow({
  href,
  children,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const rowClass = cn(
    "flex items-center gap-3 border-b border-border/50 px-4 py-2.5 text-sm transition-colors last:border-0",
    href && "hover:bg-primary/[0.04]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {children}
      </Link>
    );
  }

  return <div className={rowClass}>{children}</div>;
}
