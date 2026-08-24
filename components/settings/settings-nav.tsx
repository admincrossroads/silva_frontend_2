"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { settingsSectionsFor, settingsTitleFor } from "@/lib/config/role-access";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-shell";

function isActive(pathname: string, href: string) {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (!user) return null;

  const sections = settingsSectionsFor(user);
  const roleLabel = ROLES[user.role as RoleKey] ?? user.role;

  return (
    <div className="space-y-4">
      <PageHeader title={settingsTitleFor(user)} badge={<Badge variant="secondary">{roleLabel}</Badge>} />

      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b pb-px scrollbar-none">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = isActive(pathname, section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors -mb-px",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {section.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
