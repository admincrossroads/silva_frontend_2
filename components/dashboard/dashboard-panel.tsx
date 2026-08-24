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
    <Card className={cn("dashboard-panel overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {viewAllHref ? (
          <Button variant="ghost" size="sm" className="h-8 shrink-0 text-xs gap-1" asChild>
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
  return <p className="px-4 py-8 text-sm text-muted-foreground text-center">{message}</p>;
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
    "flex items-center gap-3 px-4 py-2.5 text-sm border-b last:border-0 transition-colors",
    href && "hover:bg-muted/50",
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
