"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/config/role-access";
import { useAuth } from "@/hooks/use-auth";
import { useActiveFarmEstate } from "@/hooks/use-active-farm-estate";
import { BrandLogo, SpxFarmMark } from "@/components/brand/spx-farm-logo";
import { siteConfig } from "@/lib/config/site";

type SidebarNavProps = {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  collapseLabel?: string;
};

export function SidebarNav({
  items,
  collapsed,
  onNavigate,
  onToggleCollapse,
  collapseLabel = "Collapse",
}: SidebarNavProps) {
  const pathname = usePathname();
  const { tenant, activeProgram } = useAuth();
  const { activeFarmEstate } = useActiveFarmEstate();
  const logoUrl = tenant?.branding?.logoUrl;
  const [openSections, setOpenSections] = useState<string[]>(() =>
    items
      .filter((item) =>
        item.children?.some(
          (c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(`${c.href}/`)),
        ),
      )
      .map((item) => item.label),
  );

  function toggleSection(label: string) {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-sidebar-border px-2 py-3",
          collapsed ? "flex-col justify-center px-2" : "px-3",
        )}
      >
        {!collapsed ? (
          <Link href="/dashboard" onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-sidebar-border"
              />
            ) : (
              <BrandLogo size="md" tone="sidebar" />
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-sidebar-foreground">
                {tenant?.displayName || siteConfig.name}
              </span>
              <span className="block truncate text-[10px] uppercase tracking-widest text-sidebar-foreground/45">
                {activeFarmEstate?.name || activeProgram?.name || "Workspace"}
              </span>
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl ring-1 ring-sidebar-border"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-primary/20 text-sidebar-brand">
                <SpxFarmMark className="h-4 w-4" />
              </span>
            )}
          </Link>
        )}

        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : collapseLabel}
            aria-label={collapsed ? "Expand sidebar" : collapseLabel}
            className={cn(
              "shrink-0 rounded-lg p-2 text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "w-full flex justify-center",
            )}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {items.map((item) => {
          if (item.href) {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-sidebar-brand shadow-sm before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-sidebar-brand"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-brand")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }

          const isOpen = openSections.includes(item.label);
          const childActive = item.children?.some(
            (c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(`${c.href}/`)),
          );
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => !collapsed && toggleSection(item.label)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  childActive
                    ? "bg-primary/10 text-sidebar-brand"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", childActive && "text-sidebar-brand")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-sidebar-foreground/50 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </>
                )}
              </button>
              {!collapsed && isOpen && item.children && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2.5">
                  {item.children.map((child) => {
                    const active =
                      pathname === child.href ||
                      (child.href !== "/" && pathname.startsWith(`${child.href}/`));
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-sidebar-brand"
                            : "text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
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
    </div>
  );
}
