"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";
import { AppShellProvider } from "@/components/layout/app-shell-context";
import { FieldMobileNav } from "@/components/layout/field-mobile-nav";
import { TenantBrandProvider } from "@/components/layout/tenant-brand-provider";
import { WorkspaceScopeSync } from "@/components/layout/workspace-scope-sync";
import { WorkspaceLoader } from "@/components/layout/workspace-loader";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const { isVendor } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return <WorkspaceLoader label={loading ? "Loading workspace…" : "Redirecting to sign in…"} />;
  }

  return (
    <TenantBrandProvider>
      <AppShellProvider>
        <WorkspaceScopeSync />
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <MobileSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden pr-2">
            <TopNav />
            <main className={`flex-1 overflow-y-auto ${isVendor ? "pb-16 md:pb-0" : ""}`}>
              <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-7">{children}</div>
            </main>
          </div>
          {isVendor ? <FieldMobileNav /> : null}
        </div>
      </AppShellProvider>
    </TenantBrandProvider>
  );
}
