"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Home",
  planning: "Budget & Commitments",
  execution: "Field Operations",
  payments: "Billing",
  vendors: "Directory",
  reports: "Reports",
  settings: "Admin",
  notifications: "Notifications",
  onboarding: "Project Setup",
  afp: "Budget (AFP)",
  afe: "Commitments (AFE)",
  "work-orders": "Schedule",
  "field-tickets": "Daily Log",
  forms: "Daily Log · Forms",
  calendar: "Schedule · Calendar",
  "payment-requests": "Billing",
  settlements: "Settlements",
  contracts: "Directory · Contracts",
  weekly: "Weekly Field Ops",
  monthly: "Monthly Cost & Progress",
  quarterly: "Quarterly Board Pack",
  annual: "Annual Report",
  "budget-vs-actual": "Cost Management",
  workspace: "Narrative Workspace",
  disclosures: "Related Parties",
  audit: "Compliance · Audit",
  "gl-exports": "Financials · GL Export",
  "coa-mapping": "Financials · COA",
  revenue: "Financials · Revenue",
  profile: "Profile",
  organization: "Organization",
  config: "Configuration",
  governance: "Compliance",
  raci: "Schedule 3 RACI",
  bands: "Spend bands",
  programs: "Programs",
  accept: "Accept Invite",
  "activity-catalog": "Activity Catalog",
  "work-order-templates": "WO Templates",
  requests: "Activity requests",
  intake: "Ad-hoc intake",
  new: "New",
};

const ID_PATTERN = /^(AFP|AFE|WO|FT|PR|STL|vct|act|WOT)-/i;

function labelFor(segment: string, index: number, segments: string[]) {
  if (LABELS[segment]) return LABELS[segment];
  if (ID_PATTERN.test(segment) || /^[a-f0-9-]{8,}$/i.test(segment)) {
    const parent = segments[index - 1];
    if (parent === "afp") return segment;
    if (parent === "afe") return segment;
    if (parent === "work-orders") return segment;
    if (parent === "field-tickets") return segment;
    if (parent === "payment-requests") return segment;
    if (parent === "settlements") return segment;
    return "Detail";
  }
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    return { href, label: labelFor(seg, i, segments), isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0">
      <Link
        href="/dashboard"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Dashboard home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex min-w-0 items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          {crumb.isLast ? (
            <span className="truncate font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="truncate text-muted-foreground hover:text-foreground transition-colors max-w-[140px] lg:max-w-none"
            >
              {crumb.label}
            </Link>
          )}
          {i === crumbs.length - 1 ? null : null}
        </span>
      ))}
    </nav>
  );
}
