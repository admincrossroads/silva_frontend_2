import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wallet,
  FileCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Users,
  BarChart3,
  Landmark,
  ScrollText,
  Shield,
  Bell,
  MessagesSquare,
  Settings,
  FileText,
  MapPin,
  ClipboardCheck,
  Mail,
} from "lucide-react";
import type { RoleKey } from "@/lib/utils/constants";
import type { User as AuthUser } from "@/types";

export type NavItem = {
  label: string;
  procoreLabel?: string;
  href?: string;
  icon: LucideIcon;
  children?: { label: string; procoreLabel?: string; href: string }[];
};

export type SettingsSection = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function isSilvaRole(role: RoleKey) {
  return role.startsWith("silva_");
}

export function isSpxRole(role: RoleKey) {
  return role.startsWith("spx_") || role === "system_admin";
}

export function isVendorRole(role: RoleKey) {
  return role.startsWith("vendor_");
}

export function canAccessSettings(user: AuthUser | null): boolean {
  return Boolean(user);
}

export function settingsSectionsFor(user: AuthUser): SettingsSection[] {
  const role = user.role as RoleKey;
  const sections: SettingsSection[] = [
    { label: "Overview", href: "/settings", icon: LayoutDashboard },
    { label: "Profile", href: "/settings/profile", icon: Settings },
  ];

  if (
    role === "system_admin" ||
    role === "spx_principal" ||
    role === "silva_owner" ||
    role === "silva_country_manager"
  ) {
    sections.push({ label: "Programs", href: "/settings/programs", icon: FileText });
  }

  if (
    role === "system_admin" ||
    role === "spx_principal" ||
    role === "vendor_admin" ||
    role === "silva_owner"
  ) {
    sections.push({
      label: role === "vendor_admin" ? "Team" : "Organization",
      href: "/settings/organization",
      icon: Users,
    });
  }

  if (role === "spx_principal" || role === "system_admin") {
    sections.push({ label: "Registrations", href: "/settings/registrations", icon: ClipboardCheck });
    sections.push({ label: "Contact inbox", href: "/settings/contact", icon: Mail });
    sections.push({ label: "Farm estates", href: "/settings/farm-estates", icon: MapPin });
  }

  if (role === "spx_principal" || role === "system_admin") {
    sections.push({ label: "Spend bands", href: "/settings/governance/bands", icon: Shield });
  }

  if (isSilvaRole(role)) {
    sections.push({ label: "Spend bands", href: "/settings/governance/bands", icon: Shield });
  }

  if (role === "spx_principal") {
    sections.push({ label: "Configuration", href: "/settings/config", icon: Shield });
    sections.push({ label: "Schedule 3 RACI", href: "/settings/governance/raci", icon: Shield });
  }

  return sections;
}

export function canAccessSettingsRoute(pathname: string, user: AuthUser): boolean {
  if (pathname.startsWith("/settings/programs")) {
    const role = user.role as RoleKey;
    return (
      role === "system_admin" ||
      role === "spx_principal" ||
      role === "silva_owner" ||
      role === "silva_country_manager" ||
      role === "vendor_admin"
    );
  }
  if (pathname.startsWith("/settings/governance/bands")) {
    const role = user.role as RoleKey;
    return isSilvaRole(role) || role === "spx_principal" || role === "system_admin";
  }
  if (pathname.startsWith("/settings/governance")) {
    return user.role === "spx_principal" || user.role === "system_admin";
  }
  return settingsSectionsFor(user).some(
    (section) => pathname === section.href || pathname.startsWith(`${section.href}/`),
  );
}

export function settingsTitleFor(user: AuthUser): string {
  const role = user.role as RoleKey;
  if (role === "system_admin") return "System Administration";
  if (role === "spx_principal") return "SPX Administration";
  if (role === "vendor_admin") return "Vendor Team Administration";
  if (isSilvaRole(role)) return "Silva Settings";
  return "Settings";
}

export function dashboardTitleFor(user: AuthUser): string {
  const role = user.role as RoleKey;
  if (role === "system_admin") return "System Admin Dashboard";
  if (role === "spx_principal") return "SPX Principal Dashboard";
  if (role === "spx_account_handler") return "SPX Operations Dashboard";
  if (role === "spx_field_supervisor") return "SPX Field Dashboard";
  if (role === "silva_owner") return "Silva Owner Dashboard";
  if (role === "silva_country_manager") return "Silva Country Manager Dashboard";
  if (role === "silva_finance") return "Silva Finance Dashboard";
  if (role === "vendor_admin") return "Vendor Admin Dashboard";
  if (role === "vendor_supervisor") return "Vendor Supervisor Dashboard";
  if (role === "vendor_field_lead") return "Field Lead Dashboard";
  if (role === "vendor_worker") return "Field Worker Dashboard";
  return "Dashboard";
}

/**
 * Procore-style project-centric navigation.
 * Labels show Procore tool name; children retain instrument routes.
 */
export function getSidebarNav(user: AuthUser | null): NavItem[] {
  if (!user) return [];

  const role = user.role as RoleKey;
  const items: NavItem[] = [
    { label: "Dashboard", procoreLabel: "Home", href: "/dashboard", icon: LayoutDashboard },
  ];

  // Budget + Commitments (planning) — hidden from field-only vendor roles except admin;
  // Silva governs AFP (Budget) but does not create or manage AFEs (Commitments).
  if (!isVendorRole(role) || role === "vendor_admin") {
    items.push({
      label: "Budget",
      procoreLabel: "Budget",
      href: "/planning/afp",
      icon: Wallet,
    });
    if (!isSilvaRole(role)) {
      items.push({
        label: "Commitments",
        procoreLabel: "Commitments",
        href: "/planning/afe",
        icon: FileCheck,
      });
    }
  }

  // Schedule + Daily Log (execution)
  const scheduleChildren: NavItem["children"] = [
    { label: "Work Orders", procoreLabel: "Schedule", href: "/execution/work-orders" },
    { label: "Season Calendar", procoreLabel: "Schedule", href: "/execution/calendar" },
  ];
  if (isSpxRole(role)) {
    scheduleChildren.push({ label: "Work Plan", procoreLabel: "Schedule", href: "/execution/work-plans" });
  }
  const dailyLogChildren: NavItem["children"] = [];
  if (!isSilvaRole(role)) {
    dailyLogChildren.push({ label: "Field Tickets", procoreLabel: "Daily Log", href: "/execution/field-tickets" });
    dailyLogChildren.push({ label: "Field Forms", procoreLabel: "Daily Log", href: "/execution/forms" });
  }

  items.push({
    label: "Schedule",
    procoreLabel: "Schedule",
    icon: CalendarDays,
    children: scheduleChildren,
  });

  if (dailyLogChildren.length) {
    items.push({
      label: "Daily Log",
      procoreLabel: "Daily Log",
      icon: ClipboardList,
      children: dailyLogChildren,
    });
  }

  // Billing
  if (isSpxRole(role) || isSilvaRole(role) || role === "vendor_admin" || role === "vendor_field_lead") {
    const billingChildren: NavItem["children"] = [];
    if (isSpxRole(role) || role === "vendor_admin" || role === "vendor_field_lead") {
      billingChildren.push({ label: "Payment Requests", procoreLabel: "Billing", href: "/payments/payment-requests" });
    }
    if (isSpxRole(role) || isSilvaRole(role)) {
      billingChildren.push({ label: "Settlements", procoreLabel: "Billing", href: "/payments/settlements" });
    }
    if (billingChildren.length) {
      items.push({ label: "Billing", procoreLabel: "Billing", icon: CreditCard, children: billingChildren });
    }
  }

  // Directory — Silva sees assigned vendors read-only; SPX manages the register
  if (isSilvaRole(role) || isSpxRole(role)) {
    items.push({
      label: "Directory",
      procoreLabel: "Directory",
      icon: Users,
      children: [
        {
          label: isSilvaRole(role) ? "Assigned vendors" : "Vendor Register",
          procoreLabel: "Directory",
          href: "/vendors",
        },
        { label: "Contracts", procoreLabel: "Directory", href: "/vendors/contracts" },
      ],
    });
  }

  // Cost Management + Financials + Reports
  if (isSilvaRole(role) || isSpxRole(role)) {
    items.push({
      label: "Cost Management",
      procoreLabel: "Cost Management",
      href: "/reports/budget-vs-actual",
      icon: BarChart3,
    });

    if (isSpxRole(role)) {
      const financialChildren = [
        { label: "GL Exports", procoreLabel: "Financials", href: "/reports/gl-exports" },
        { label: "COA Mapping", procoreLabel: "Financials", href: "/reports/coa-mapping" },
      ];
      if (role === "spx_principal" || role === "system_admin") {
        financialChildren.unshift({
          label: "Revenue Ledger",
          procoreLabel: "Financials",
          href: "/reports/revenue",
        });
      }
      items.push({
        label: "Financials",
        procoreLabel: "Financials",
        icon: Landmark,
        children: financialChildren,
      });
    }

    const reportChildren = [
      { label: "Weekly", procoreLabel: "Reports", href: "/reports/weekly" },
      { label: "Monthly", procoreLabel: "Reports", href: "/reports/monthly" },
      { label: "Quarterly", procoreLabel: "Reports", href: "/reports/quarterly" },
      { label: "Annual", procoreLabel: "Reports", href: "/reports/annual" },
      { label: "Related Parties", procoreLabel: "Reports", href: "/reports/disclosures" },
    ];
    if (isSpxRole(role)) {
      reportChildren.push({ label: "Narrative Workspace", procoreLabel: "Reports", href: "/reports/workspace" });
    }
    items.push({ label: "Reports", procoreLabel: "Reports", icon: ScrollText, children: reportChildren });

    const complianceChildren = [];
    if (role === "spx_principal" || role === "system_admin" || role === "silva_owner") {
      complianceChildren.push({ label: "Audit Trail", procoreLabel: "Compliance", href: "/reports/audit" });
    }
    if (isSilvaRole(role)) {
      complianceChildren.push({ label: "Spend bands", procoreLabel: "Compliance", href: "/settings/governance/bands" });
    }
    if (role === "spx_principal") {
      complianceChildren.push({ label: "Schedule 3 RACI", procoreLabel: "Compliance", href: "/settings/governance/raci" });
    }
    if (complianceChildren.length) {
      items.push({ label: "Compliance", procoreLabel: "Compliance", icon: Shield, children: complianceChildren });
    }
  }

  items.push({ label: "Notifications", href: "/notifications", icon: Bell });

  const canMessages =
    isSpxRole(role) ||
    isSilvaRole(role) ||
    role === "vendor_admin" ||
    role === "vendor_manager" ||
    role === "vendor_supervisor" ||
    role === "vendor_field_lead";
  if (canMessages) {
    items.push({ label: "Messages", href: "/messages", icon: MessagesSquare });
  }

  const settingsChildren = settingsSectionsFor(user)
    .filter((section) => section.href !== "/settings")
    .map((section) => ({ label: section.label, href: section.href }));

  items.push({
    label: role === "system_admin" || role === "spx_principal" || role === "vendor_admin" ? "Admin" : "Settings",
    procoreLabel: "Admin",
    icon: Settings,
    children: [{ label: "Overview", href: "/settings" }, ...settingsChildren],
  });

  return items;
}
