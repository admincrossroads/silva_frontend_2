"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/** Applies tenant branding CSS variables when available. */
export function TenantBrandProvider({ children }: { children: React.ReactNode }) {
  const tenant = useAuthStore((s) => s.tenant);
  const activeProgram = useAuthStore((s) => s.activeProgram);

  useEffect(() => {
    const color =
      (tenant?.branding as { primaryColor?: string } | null)?.primaryColor ||
      (activeProgram?.branding as { primaryColor?: string } | null)?.primaryColor;
    if (color && typeof document !== "undefined") {
      document.documentElement.style.setProperty("--tenant-accent", color);
    }
  }, [tenant, activeProgram]);

  return <>{children}</>;
}
