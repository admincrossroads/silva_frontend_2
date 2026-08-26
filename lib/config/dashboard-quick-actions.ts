import {
  ClipboardList,
  FileText,
  FileCheck,
  BarChart3,
  PlusCircle,
  LayoutDashboard,
  Wallet,
  Users,
  ClipboardCheck,
  MapPin,
} from "lucide-react";
import type { QuickAction } from "@/components/dashboard/quick-actions";
import type { User } from "@/types";
import { isSilvaRole, isSpxRole, isVendorRole } from "@/lib/config/role-access";
import type { RoleKey } from "@/lib/utils/constants";

export function quickActionsFor(user: User): QuickAction[] {
  const role = user.role as RoleKey;

  if (role === "spx_principal" || role === "system_admin") {
    return [
      { label: "Registrations", href: "/settings/registrations", icon: ClipboardCheck },
      { label: "Farm estates", href: "/settings/farm-estates", icon: MapPin },
      { label: "Field tickets", href: "/execution/field-tickets", icon: FileText },
      { label: "Revenue ledger", href: "/reports/revenue", icon: Wallet },
    ];
  }

  if (isSpxRole(role)) {
    return [
      { label: "Ad-hoc intake", href: "/planning/intake", icon: ClipboardList },
      { label: "AFE register", href: "/planning/afe", icon: FileCheck },
      { label: "Work orders", href: "/execution/work-orders", icon: ClipboardList },
      { label: "Field tickets", href: "/execution/field-tickets", icon: FileText },
    ];
  }

  if (isSilvaRole(role)) {
    return [
      { label: "Request ad-hoc", href: "/planning/intake", icon: PlusCircle },
      { label: "Review AFP", href: "/planning/afp", icon: Wallet },
      { label: "Budget vs actual", href: "/reports/budget-vs-actual", icon: BarChart3 },
      { label: "Monthly reports", href: "/reports/monthly", icon: FileText },
    ];
  }

  if (isVendorRole(role)) {
    return [
      { label: "Field forms", href: "/execution/forms", icon: LayoutDashboard },
      { label: "New ticket", href: "/execution/field-tickets", icon: PlusCircle },
      { label: "Work orders", href: "/execution/work-orders", icon: ClipboardList },
      { label: "Payments", href: "/payments/payment-requests", icon: Wallet },
    ];
  }

  return [{ label: "Programs", href: "/settings/programs", icon: Users }];
}
