"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, LayoutDashboard, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

/** Procore-style field bottom nav — Schedule, Daily Log, Billing */
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

export function FieldMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-4 h-14">
        {tabs.map((tab) => {
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
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
