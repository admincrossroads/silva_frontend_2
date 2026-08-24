"use client";

import type { User } from "@/types";
import { dashboardTitleFor } from "@/lib/config/role-access";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import { dashboardTitleKeyForRole } from "@/lib/i18n/vendor-messages";

type DashboardHeaderProps = {
  user: User;
};

function greeting(t: (key: import("@/lib/i18n/vendor-messages").VendorMessageKey) => string, isVendor: boolean) {
  const hour = new Date().getHours();
  if (!isVendor) {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }
  if (hour < 12) return t("dashboard.greeting.morning");
  if (hour < 17) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { isVendor, isAmharic, t } = useVendorLocale();
  const roleLabel = ROLES[user.role as RoleKey] ?? user.role;
  const title = isVendor ? t(dashboardTitleKeyForRole(user.role)) : dashboardTitleFor(user);
  const today = new Date().toLocaleDateString(isVendor && isAmharic ? "am-ET" : undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="dashboard-header rounded-xl border bg-card/80 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{today}</p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl xl:text-4xl">
            {greeting(t, isVendor)}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {title} · {roleLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
