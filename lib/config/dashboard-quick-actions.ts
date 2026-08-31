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
      { label: "Interventions", href: "/operations/interventions", icon: ClipboardList },
      { label: "Projects", href: "/operations/projects", icon: FileCheck },
      { label: "Validation queue", href: "/validation/queue", icon: FileCheck },
      { label: "Block plan", href: "/planning/afp-blocks", icon: Wallet },
    ];
  }

  if (isSpxRole(role)) {
    return [
      { label: "Weekly entry", href: "/execution/weekly-entry", icon: ClipboardList },
      { label: "Validation queue", href: "/validation/queue", icon: FileCheck },
      { label: "Interventions", href: "/operations/interventions", icon: ClipboardList },
      { label: "Projects", href: "/operations/projects", icon: FileCheck },
      { label: "Block plan", href: "/planning/afp-blocks", icon: FileText },
    ];
  }

  if (isSilvaRole(role)) {
    return [
      { label: "New intervention", href: "/operations/interventions", icon: PlusCircle },
      { label: "New project", href: "/operations/projects", icon: FileCheck },
      { label: "Rate approvals", href: "/planning/rate-card-approvals", icon: FileCheck },
      { label: "Commitments (ETB)", href: "/planning/cropfort-afe-approvals", icon: BarChart3 },
    ];
  }

  if (isVendorRole(role)) {
    const actions: QuickAction[] = [
      { label: "Weekly entry", href: "/execution/weekly-entry", icon: LayoutDashboard },
      { label: "Interventions", href: "/operations/interventions", icon: PlusCircle },
      { label: "Projects", href: "/operations/projects", icon: FileCheck },
      { label: "New ticket", href: "/execution/field-tickets", icon: PlusCircle },
    ];
    if (role !== "vendor_worker") {
      actions.push({ label: "Work orders", href: "/execution/work-orders", icon: ClipboardList });
    }
    actions.push({ label: "Payments", href: "/payments/payment-requests", icon: Wallet });
    return actions;
  }

  return [{ label: "Programs", href: "/settings/programs", icon: Users }];
}
