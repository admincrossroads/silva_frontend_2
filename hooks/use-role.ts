"use client";
import { useAuthStore } from "@/stores/auth-store";
import {
  SILVA_ROLES,
  SPX_ROLES,
  VENDOR_ROLES,
  WORK_PLAN_MANAGE_ROLES,
  type RoleKey,
} from "@/lib/utils/constants";

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? "") as RoleKey;
  return {
    user,
    role,
    isSilva: SILVA_ROLES.includes(role),
    isSpx: SPX_ROLES.includes(role),
    isVendor: VENDOR_ROLES.includes(role),
    isSystemAdmin: role === "system_admin",
    isSpxPrincipal: role === "spx_principal",
    isVendorAdmin: role === "vendor_admin",
    canManageWorkPlan: WORK_PLAN_MANAGE_ROLES.includes(role),
  };
}

