"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSidebarNav } from "@/lib/config/role-access";
import { useAuth } from "@/hooks/use-auth";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import { useLocalizedNavItems } from "@/lib/i18n/translate-nav";
import { useAppShell } from "@/components/layout/app-shell-context";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar } from "@/components/ui/avatar";
import { ROLES, type RoleKey } from "@/lib/utils/constants";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppShell();
  const { isVendor, locale, t } = useVendorLocale();
  const rawNav = user ? getSidebarNav(user) : [];
  const sidebarNav = useLocalizedNavItems(rawNav, locale, isVendor);
  const roleLabel = user ? ROLES[user.role as RoleKey] ?? user.role : "";

  return (
    <aside
      className={cn(
        "app-sidebar hidden md:flex flex-col shrink-0 self-start transition-all duration-300 ease-out",
        "sticky top-2 ml-2 h-[calc(100dvh-1rem)] xl:top-3 xl:ml-3 xl:h-[calc(100dvh-1.5rem)]",
        "rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl shadow-black/10",
        "overflow-hidden",
        sidebarCollapsed ? "w-[72px] xl:w-[80px]" : "w-[264px] xl:w-[280px] 3xl:w-[300px]",
      )}
    >
      <div className="h-1 shrink-0 bg-gradient-to-r from-sidebar-brand via-primary to-sidebar-brand/40" />
      <SidebarNav
        items={sidebarNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        collapseLabel={isVendor ? t("nav.collapse") : "Collapse sidebar"}
      />

      <div className={cn("mt-auto border-t border-sidebar-border p-2", sidebarCollapsed && "px-1.5")}>
        {!sidebarCollapsed && user ? (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">{user.name}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-label={isVendor ? t("menu.signOut") : "Sign out"}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : sidebarCollapsed && user ? (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={isVendor ? t("menu.signOut") : "Sign out"}
            title={isVendor ? t("menu.signOut") : "Sign out"}
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const { user } = useAuth();
  const { mobileNavOpen, setMobileNavOpen } = useAppShell();
  const { isVendor, locale } = useVendorLocale();
  const pathname = usePathname();
  const rawNav = user ? getSidebarNav(user) : [];
  const sidebarNav = useLocalizedNavItems(rawNav, locale, isVendor);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  if (!mobileNavOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,280px)] flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-2xl shadow-black/20 md:hidden">
        <div className="h-1 shrink-0 bg-gradient-to-r from-sidebar-brand via-primary to-sidebar-brand/40" />
        <SidebarNav items={sidebarNav} onNavigate={() => setMobileNavOpen(false)} />
        {user ? (
          <div className="border-t border-sidebar-border p-3">
            <Link
              href="/settings/profile"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-accent"
            >
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/50">{user.email}</p>
              </div>
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
