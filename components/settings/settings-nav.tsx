"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { settingsSectionsFor } from "@/lib/config/role-access";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  if (!user) return null;

  const sections = settingsSectionsFor(user);
  const roleLabel = ROLES[user.role as RoleKey] ?? user.role;

  return (
    <aside className="flex w-full shrink-0 flex-col self-start lg:sticky lg:top-6 lg:max-h-[calc(100dvh-7rem)] lg:w-52 xl:w-56">
      <div className="flex max-h-inherit flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="shrink-0 border-b border-border px-3 py-3">
          <p className="text-sm font-semibold text-foreground">Settings</p>
          <Badge variant="secondary" className="mt-2 text-[10px]">
            {roleLabel}
          </Badge>
        </div>

        <nav
          ref={navRef}
          aria-label="Settings sections"
          className="sidebar-scroll space-y-0.5 overflow-y-auto p-2"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            const active = isActive(pathname, section.href);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                {section.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
