"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  planning: "Planning",
  execution: "Execution",
  payments: "Payments",
  vendors: "Vendors",
  reports: "Reports",
  settings: "Settings",
  afp: "AFP Register",
  afe: "AFE Register",
  "work-orders": "Work Orders",
  "field-tickets": "Field Tickets",
  "payment-requests": "Payment Requests",
  settlements: "Settlements",
  weekly: "Weekly",
  monthly: "Monthly",
  "budget-vs-actual": "Budget vs Actual",
  profile: "Profile",
  organization: "Organization",
  config: "Configuration",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    const label = labels[seg] || seg;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
