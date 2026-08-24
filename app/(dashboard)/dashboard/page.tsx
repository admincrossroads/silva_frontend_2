"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import { translateQuickActionLabel } from "@/lib/i18n/vendor-messages";
import { quickActionsFor } from "@/lib/config/dashboard-quick-actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SilvaDashboard } from "@/components/dashboards/silva-dashboard";
import { SpxDashboard } from "@/components/dashboards/spx-dashboard";
import { SpxPrincipalDashboard } from "@/components/dashboards/spx-principal-dashboard";
import { VendorDashboard } from "@/components/dashboards/vendor-dashboard";
import { SystemAdminDashboard } from "@/components/dashboards/system-admin-dashboard";
import { PageShell } from "@/components/layout/page-shell";
import { FarmAreaScopeBanner } from "@/components/layout/farm-area-scope-banner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isSilva, isSpx, isVendor, role } = useRole();
  const { isVendor: vendorI18n, locale, t } = useVendorLocale();

  const actions = useMemo(() => {
    if (!user) return [];
    const base = quickActionsFor(user);
    if (!vendorI18n || locale === "en") return base;
    return base.map((action) => ({
      ...action,
      label: translateQuickActionLabel(action.label, locale),
    }));
  }, [user, vendorI18n, locale]);

  if (!user) return null;

  return (
    <PageShell>
      <FarmAreaScopeBanner />
      <DashboardHeader user={user} />
      <QuickActions actions={actions} title={vendorI18n ? t("dashboard.quickActions") : undefined} />

      {role === "system_admin" && <SystemAdminDashboard />}
      {role !== "system_admin" && isSilva && <SilvaDashboard />}
      {(role === "spx_principal" || role === "system_admin") && <SpxPrincipalDashboard />}
      {role !== "system_admin" && role !== "spx_principal" && isSpx && !isSilva && <SpxDashboard />}
      {isVendor && role !== "system_admin" && <VendorDashboard />}
    </PageShell>
  );
}
