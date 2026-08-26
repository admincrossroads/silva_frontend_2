import {
  ClipboardList,
  FileText,
  FileCheck,
  BarChart3,
  PlusCircle,
  LayoutDashboard,
  Wallet,
  Inbox,
  Send,
} from "lucide-react";
import type { QuickAction } from "@/components/dashboard/quick-actions";
import type { User } from "@/types";
import { isSilvaRole, isSpxRole, isVendorRole } from "@/lib/config/role-access";
import type { RoleKey } from "@/lib/utils/constants";

export function quickActionsFor(user: User): QuickAction[] {
  const role = user.role as RoleKey;

  if (role === "spx_principal" || role === "system_admin") {
    return [
      { label: "Ad-hoc intake", href: "/planning/intake", icon: Inbox },
      { label: "AFE register", href: "/planning/afe", icon: FileCheck },
      { label: "Work orders", href: "/execution/work-orders", icon: ClipboardList },
      { label: "Report workspace", href: "/reports/workspace", icon: BarChart3 },
    ];
  }

  if (isSpxRole(role)) {
    return [
      { label: "Ad-hoc intake", href: "/planning/intake", icon: Inbox },
      { label: "AFE register", href: "/planning/afe", icon: FileCheck },
      { label: "Work orders", href: "/execution/work-orders", icon: ClipboardList },
      { label: "Reports", href: "/reports/workspace", icon: BarChart3 },
    ];
  }

  if (isSilvaRole(role)) {
    return [
      { label: "Approve AFEs", href: "/planning/afe", icon: FileCheck },
      { label: "My requests", href: "/planning/requests", icon: Send },
      { label: "Monthly reports", href: "/reports/monthly", icon: FileText },
      { label: "Budget vs actual", href: "/reports/budget-vs-actual", icon: BarChart3 },
    ];
  }

  if (isVendorRole(role)) {
    const actions: QuickAction[] = [
      { label: "Field forms", href: "/execution/forms", icon: LayoutDashboard },
      { label: "New ticket", href: "/execution/field-tickets", icon: PlusCircle },
      { label: "Work orders", href: "/execution/work-orders", icon: ClipboardList },
      { label: "Payments", href: "/payments/payment-requests", icon: Wallet },
    ];
    if (role === "vendor_admin" || role === "vendor_manager" || role === "vendor_field_lead") {
      actions.unshift({ label: "Request work", href: "/planning/requests/new", icon: Send });
    }
    return actions.slice(0, 4);
  }

  return [{ label: "Programs", href: "/settings/programs", icon: LayoutDashboard }];
}
