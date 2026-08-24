"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  applyWorkspaceTheme,
  clearWorkspaceThemeOverrides,
  resolveWorkspaceColor,
} from "@/lib/branding/workspace-theme";
export function TenantBrandProvider({ children }: { children: React.ReactNode }) {
  const tenant = useAuthStore((s) => s.tenant);
  const activeProgram = useAuthStore((s) => s.activeProgram);

  useEffect(() => {
    const syncTheme = () => {
      const color = resolveWorkspaceColor(
        tenant?.branding?.primaryColor,
        activeProgram?.branding?.primaryColor,
      );
      const isDark = document.documentElement.classList.contains("dark");
      if (color) {
        applyWorkspaceTheme(color, isDark);
      } else {
        clearWorkspaceThemeOverrides();
      }
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      clearWorkspaceThemeOverrides();
    };
  }, [tenant, activeProgram]);

  return <>{children}</>;
}
