"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { dashboardTitleFor } from "@/lib/config/role-access";
import { SilvaDashboard } from "@/components/dashboards/silva-dashboard";
import { SpxDashboard } from "@/components/dashboards/spx-dashboard";
import { VendorDashboard } from "@/components/dashboards/vendor-dashboard";
import { SystemAdminDashboard } from "@/components/dashboards/system-admin-dashboard";
import { ROLES, type RoleKey } from "@/lib/utils/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isSilva, isSpx, isVendor, role } = useRole();

  if (!user) return null;

  const roleLabel = ROLES[role as RoleKey] ?? role;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{dashboardTitleFor(user)}</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.name} · {roleLabel}
        </p>
      </div>

      {role === "system_admin" && <SystemAdminDashboard />}
      {role !== "system_admin" && isSilva && <SilvaDashboard />}
      {role !== "system_admin" && isSpx && !isSilva && <SpxDashboard />}
      {isVendor && role !== "system_admin" && <VendorDashboard />}
    </div>
  );
}
