"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Plus,
  ScrollText,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
    match: (p: string) => p === "/dashboard",
  },
  {
    href: "/execution/work-orders",
    label: "Schedule",
    icon: CalendarDays,
    match: (p: string) =>
      p.startsWith("/execution/work-orders") || p.startsWith("/execution/calendar"),
  },
  {
    href: "/execution/field-tickets",
    label: "Daily Log",
    icon: ScrollText,
    match: (p: string) =>
      p.startsWith("/execution/field-tickets") || p.startsWith("/execution/forms"),
  },
  {
    href: "/payments/payment-requests",
    label: "Billing",
    icon: ClipboardList,
    match: (p: string) => p.startsWith("/payments"),
  },
];

const quickActions = [
  {
    href: "/execution/field-tickets?new=1",
    label: "New field ticket",
    hint: "Log today's work",
    icon: FilePlus2,
  },
  {
    href: "/execution/forms",
    label: "Field form",
    hint: "IFS / inspection",
    icon: ScrollText,
  },
  {
    href: "/payments/payment-requests?new=1",
    label: "Payment request",
    hint: "Invoice validated work",
    icon: Wallet,
  },
  {
    href: "/execution/calendar",
    label: "Season calendar",
    hint: "This week's windows",
    icon: CalendarDays,
  },
];

export function FieldMobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {menuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close quick actions"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.75rem)] left-3 right-3 rounded-2xl border bg-card p-3 shadow-xl">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick actions
            </p>
            <div className="grid gap-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-muted active:bg-muted"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{action.label}</span>
                      <span className="block text-xs text-muted-foreground">{action.hint}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
        <div className="relative grid h-14 grid-cols-5">
          {tabs.slice(0, 2).map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "scale-110")} />
                {tab.label}
              </Link>
            );
          })}

          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label={menuOpen ? "Close quick actions" : "Open quick actions"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background shadow-lg transition",
                menuOpen ? "bg-foreground text-background" : "bg-primary text-primary-foreground",
              )}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>

          {tabs.slice(2).map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "scale-110")} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
