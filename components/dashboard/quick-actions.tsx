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
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/30 px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href + action.label}
              href={action.href}
              className={cn(
                "group flex flex-col gap-2 bg-card p-4 transition-colors",
                "hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              )}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <Icon className="h-4 w-4" />
              </span>
              <span className="block text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
