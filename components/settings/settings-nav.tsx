"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { settingsSectionsFor, settingsTitleFor } from "@/lib/config/role-access";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="space-y-4 border-b pb-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{settingsTitleFor(user)}</h1>
          <Badge variant="secondary">{roleLabel}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {user.role === "system_admin" && "Platform-wide user and organization management."}
          {user.role === "spx_principal" && "Governance configuration, organizations, and user administration."}
          {user.role === "vendor_admin" && "Manage your vendor field team and pending invites."}
          {user.role.startsWith("silva_") && "Organization profile and account preferences."}
          {!["system_admin", "spx_principal", "vendor_admin"].includes(user.role) &&
            !user.role.startsWith("silva_") &&
            "Account preferences for your role."}
        </p>
      </div>

      <nav aria-label="Settings sections" className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = isActive(pathname, section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: active ? "secondary" : "outline", size: "sm" }),
                active && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
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
