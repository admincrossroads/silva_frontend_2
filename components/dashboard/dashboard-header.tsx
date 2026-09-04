"use client";

import type { User } from "@/types";
import { useVendorLocale } from "@/hooks/use-vendor-locale";

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
  const today = new Date().toLocaleDateString(isVendor && isAmharic ? "am-ET" : undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isSilva = user.role?.startsWith("silva_") || user.organizationType === "silva";
  const firstName = user.name.split(" ")[0];
  // Silva is the company — don't greet the org name as a person
  const title = isSilva || firstName.toLowerCase() === "silva" ? greeting(t, isVendor) : `${greeting(t, isVendor)}, ${firstName}`;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{today}</p>
      <h1 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h1>
    </div>
  );
}
