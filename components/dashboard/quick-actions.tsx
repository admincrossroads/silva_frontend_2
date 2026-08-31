"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function QuickActions({ actions, title = "Quick actions" }: { actions: QuickAction[]; title?: string }) {
  if (!actions.length) return null;

  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
      <div className="border-b border-border/80 bg-muted/30 px-4 py-2.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border/80 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href + action.label}
              href={action.href}
              className={cn(
                "group flex flex-col gap-2 bg-card p-3 transition-colors",
                "hover:bg-primary/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
