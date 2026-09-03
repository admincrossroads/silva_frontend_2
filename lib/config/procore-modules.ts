import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wallet,
  FileCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Landmark,
  ScrollText,
  Shield,
  Bell,
  Settings,
  Layers,
} from "lucide-react";

/** Procore-style workflow columns for board views */
export const DEFAULT_WORKFLOW = [
  "draft",
  "submitted",
  "validated",
  "approved",
  "active",
  "closed",
] as const;

export const WO_WORKFLOW = ["draft", "issued", "in_progress", "complete", "closed"] as const;

export type ModuleViewMode = "board" | "table" | "calendar";

export type ProcoreModuleId =
  | "dashboard"
  | "budget"
  | "commitments"
  | "schedule"
  | "daily_log"
  | "billing"
  | "directory"
  | "cost_management"
  | "financials"
  | "reports"
  | "compliance"
  | "admin";

export type ProcoreModuleDef = {
  id: ProcoreModuleId;
  procoreLabel: string;
  instrumentLabel: string;
  href?: string;
  icon: LucideIcon;
  workflow?: readonly string[];
  views?: ModuleViewMode[];
};

export const PROCORE_MODULES: Record<ProcoreModuleId, ProcoreModuleDef> = {
  dashboard: {
    id: "dashboard",
    procoreLabel: "Home",
    instrumentLabel: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  budget: {
    id: "budget",
    procoreLabel: "Budget",
    instrumentLabel: "Annual Plan",
    href: "/planning/afp",
    icon: Wallet,
    workflow: DEFAULT_WORKFLOW,
    views: ["board", "table"],
  },
  commitments: {
    id: "commitments",
    procoreLabel: "AFEs",
    instrumentLabel: "AFEs",
    href: "/planning/afe",
    icon: FileCheck,
    workflow: DEFAULT_WORKFLOW,
    views: ["board", "table"],
  },
  schedule: {
    id: "schedule",
    procoreLabel: "Schedule",
    instrumentLabel: "Work Orders",
    href: "/execution/work-orders",
    icon: CalendarDays,
    workflow: WO_WORKFLOW,
    views: ["board", "table", "calendar"],
  },
  daily_log: {
    id: "daily_log",
    procoreLabel: "Daily Log",
    instrumentLabel: "Field Tickets",
    href: "/execution/field-tickets",
    icon: ClipboardList,
    workflow: DEFAULT_WORKFLOW,
    views: ["board", "table"],
  },
  billing: {
    id: "billing",
    procoreLabel: "Billing",
    instrumentLabel: "Payment Requests",
    href: "/payments/payment-requests",
    icon: CreditCard,
    workflow: DEFAULT_WORKFLOW,
    views: ["board", "table"],
  },
  directory: {
    id: "directory",
    procoreLabel: "Directory",
    instrumentLabel: "Vendor Register",
    href: "/vendors",
    icon: Users,
    views: ["board", "table"],
  },
  cost_management: {
    id: "cost_management",
    procoreLabel: "Cost Management",
    instrumentLabel: "Budget vs Actual",
    href: "/reports/budget-vs-actual",
    icon: BarChart3,
    views: ["board", "table"],
  },
  financials: {
    id: "financials",
    procoreLabel: "Financials",
    instrumentLabel: "Revenue Ledger",
    href: "/reports/revenue",
    icon: Landmark,
    views: ["table"],
  },
  reports: {
    id: "reports",
    procoreLabel: "Reports",
    instrumentLabel: "Reports",
    icon: ScrollText,
    views: ["table"],
  },
  compliance: {
    id: "compliance",
    procoreLabel: "Compliance",
    instrumentLabel: "Audit & Governance",
    icon: Shield,
    views: ["table"],
  },
  admin: {
    id: "admin",
    procoreLabel: "Admin",
    instrumentLabel: "Settings",
    href: "/settings",
    icon: Settings,
  },
};

export function procorePageTitle(moduleId: ProcoreModuleId) {
  const m = PROCORE_MODULES[moduleId];
  return `${m.procoreLabel} · ${m.instrumentLabel}`;
}

export function formatWorkflowLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
