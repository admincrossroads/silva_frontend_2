import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Truck,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Building2,
  Shield,
  User,
} from "lucide-react";
import type { RoleKey } from "@/lib/utils/constants";
import type { User as AuthUser } from "@/types";

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
};

export type SettingsSection = {
  label: string;
  href: string;
  description: string;
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
    {
      label: "Overview",
      href: "/settings",
      description: "Role-scoped administration summary.",
      icon: LayoutDashboard,
    },
    {
      label: "Profile",
      href: "/settings/profile",
      description: "Your account and password.",
      icon: User,
    },
  ];

  if (
    role === "system_admin" ||
    role === "spx_principal" ||
    role === "vendor_admin" ||
    role === "silva_owner"
  ) {
    sections.push({
      label: role === "vendor_admin" ? "Team" : "Organization",
      href: "/settings/organization",
      description:
        role === "vendor_admin"
          ? "Manage vendor team members and invites."
          : "Organization directory and membership.",
      icon: Building2,
    });
  }

  if (role === "spx_principal") {
    sections.push({
      label: "Configuration",
      href: "/settings/config",
      description: "Schedule 3, accountability matrix, and platform reference data.",
      icon: Shield,
    });
  }

  return sections;
}

export function canAccessSettingsRoute(pathname: string, user: AuthUser): boolean {
  const allowed = settingsSectionsFor(user).some(
    (section) => pathname === section.href || pathname.startsWith(`${section.href}/`),
  );
  return allowed;
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

export function getSidebarNav(user: AuthUser | null): NavItem[] {
  if (!user) return [];

  const role = user.role as RoleKey;
  const items: NavItem[] = [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];

  if (!isVendorRole(role) || role === "vendor_admin") {
    items.push({
      label: "Planning",
      icon: FileText,
      children: [
        { label: "AFP Register", href: "/planning/afp" },
        { label: "AFE Register", href: "/planning/afe" },
      ],
    });
  }

  const executionChildren: { label: string; href: string }[] = [
    { label: "Work Orders", href: "/execution/work-orders" },
  ];
  if (!isSilvaRole(role)) {
    executionChildren.push({ label: "Field Tickets", href: "/execution/field-tickets" });
  }
  items.push({ label: "Execution", icon: ClipboardList, children: executionChildren });

  if (isSpxRole(role) || isSilvaRole(role) || role === "vendor_admin" || role === "vendor_field_lead") {
    const paymentChildren: { label: string; href: string }[] = [];
    if (isSpxRole(role) || role === "vendor_admin" || role === "vendor_field_lead") {
      paymentChildren.push({ label: "Payment Requests", href: "/payments/payment-requests" });
    }
    if (isSpxRole(role) || isSilvaRole(role)) {
      paymentChildren.push({ label: "Settlements", href: "/payments/settlements" });
    }
    if (paymentChildren.length > 0) {
      items.push({ label: "Payments", icon: CreditCard, children: paymentChildren });
    }
  }

  if (isSilvaRole(role) || isSpxRole(role)) {
    items.push({ label: "Vendors", href: "/vendors", icon: Users });
  }

  if (isSilvaRole(role) || isSpxRole(role)) {
    const reportChildren = [
      { label: "Weekly", href: "/reports/weekly" },
      { label: "Monthly", href: "/reports/monthly" },
      { label: "Budget vs Actual", href: "/reports/budget-vs-actual" },
    ];
    if (role === "spx_principal") {
      reportChildren.push({ label: "Revenue Ledger", href: "/reports/revenue" });
    }
    items.push({
      label: "Reports",
      icon: BarChart3,
      children: reportChildren,
    });
  }

  const settingsChildren = settingsSectionsFor(user)
    .filter((section) => section.href !== "/settings")
    .map((section) => ({ label: section.label, href: section.href }));

  items.push({
    label: role === "system_admin" || role === "spx_principal" || role === "vendor_admin" ? "Admin" : "Settings",
    icon: Settings,
    children: [{ label: "Overview", href: "/settings" }, ...settingsChildren],
  });

  return items;
}
