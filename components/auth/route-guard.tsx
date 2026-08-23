"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkRouteAccess } from "@/lib/config/route-access";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, activeProgram } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (!activeProgram && !pathname.startsWith("/settings/programs")) {
      router.replace("/settings/programs");
      return;
    }
    const access = checkRouteAccess(pathname, user);
    if (!access.allowed) {
      const params = new URLSearchParams({ from: pathname, reason: access.reason || "Forbidden" });
      router.replace(`/forbidden?${params.toString()}`);
    }
  }, [loading, user, pathname, router, activeProgram]);

  return <>{children}</>;
}
