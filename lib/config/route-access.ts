import type { RoleKey } from "@/lib/utils/constants";
import type { User } from "@/types";
import { isSilvaRole, isSpxRole, isVendorRole } from "@/lib/config/role-access";

export function checkRouteAccess(pathname: string, user: User | null): { allowed: boolean; reason?: string } {
  if (!user) return { allowed: false, reason: "Sign in required." };
  const role = user.role as RoleKey;

  if (pathname.startsWith("/execution/field-tickets") && isSilvaRole(role)) {
    return { allowed: false, reason: "Silva cannot access raw field tickets." };
  }
  if (pathname.startsWith("/execution/forms/review") && !["vendor_manager", "vendor_supervisor", "vendor_admin", "spx_principal", "spx_account_handler", "spx_field_supervisor", "system_admin"].includes(role)) {
    return { allowed: false, reason: "Form review queue is manager or SPX only." };
  }
  if (pathname.startsWith("/execution/forms") && isSilvaRole(role)) {
    return { allowed: false, reason: "Silva cannot access field monitoring forms." };
  }
  if (pathname.startsWith("/planning/annual") && !["spx_account_handler", "spx_principal", "system_admin"].includes(role)) {
    return { allowed: false, reason: "Annual planning is SPX Planner only." };
  }
  if (pathname.startsWith("/planning/intake") && !isSpxRole(role)) {
    return { allowed: false, reason: "Ad-hoc intake is SPX Planner only." };
  }
  if (pathname.startsWith("/planning/requests") && !isSilvaRole(role)) {
    return { allowed: false, reason: "Activity requests are Silva-only." };
  }
  if ((pathname.startsWith("/planning/afp") || pathname.startsWith("/planning/annual")) && isVendorRole(role)) {
    return { allowed: false, reason: "Vendor field roles cannot access annual planning." };
  }
  if (pathname.startsWith("/reports/revenue") && role !== "spx_principal") {
    return { allowed: false, reason: "Revenue ledger is principal-only." };
  }
  if (pathname.startsWith("/reports/workspace") && !isSpxRole(role)) {
    return { allowed: false, reason: "Report workspace is SPX-only." };
  }

  return { allowed: true };
}
