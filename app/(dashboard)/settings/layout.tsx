"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SettingsNav } from "@/components/settings/settings-nav";
import { useAuth } from "@/hooks/use-auth";
import { canAccessSettingsRoute } from "@/lib/config/role-access";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (!canAccessSettingsRoute(pathname, user)) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <SettingsNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
