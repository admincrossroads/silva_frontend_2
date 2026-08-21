"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeftClose, PanelLeft, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSidebarNav } from "@/lib/config/role-access";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, tenant, activeProgram } = useAuth();
  const sidebarNav = user ? getSidebarNav(user) : [];
  const brandName = tenant?.displayName || "Coffee Field OS";
  const programLabel = activeProgram?.name || "Workspace";

  useEffect(() => {
    sidebarNav.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        setOpenSections((prev) => (prev.includes(item.label) ? prev : [...prev, item.label]));
      }
    });
  }, [pathname, user?.role]);

  function toggleSection(label: string) {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground transition-all duration-200 ease-out shrink-0 border-r border-sidebar-border",
        collapsed ? "w-[56px]" : "w-[236px]",
      )}
    >
      <div className={cn("flex items-center gap-2 px-3 py-4", collapsed && "justify-center px-2")}>
          {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/25">
              <Coffee className="h-4 w-4 text-[hsl(152_70%_72%)]" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[15px] leading-tight text-sidebar-foreground truncate">
                {brandName}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/45 truncate">
                {programLabel}
              </span>
            </span>
          </Link>
        ) : (
          <Coffee className="h-4 w-4 text-[hsl(152_70%_72%)]" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-px px-2 overflow-y-auto pb-4">
        {sidebarNav.map((item) => {
          if (item.href) {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-[hsl(152_70%_72%)]"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }

          const isOpen = openSections.includes(item.label);
          const childActive = item.children?.some((child) => pathname === child.href);

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleSection(item.label)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  childActive
                    ? "text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 text-sidebar-foreground/50 transition-transform duration-150",
                        isOpen && "rotate-180",
                      )}
                    />
                  </>
                )}
              </button>
              {!collapsed && isOpen && item.children && (
                <div className="mt-0.5 ml-[22px] border-l border-sidebar-border pl-2.5 space-y-px">
                  {item.children.map((child) => {
                    const active = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "text-[hsl(152_70%_72%)]"
                            : "text-sidebar-foreground/55 hover:text-sidebar-foreground",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
