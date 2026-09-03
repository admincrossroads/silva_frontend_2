"use client";

import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

type TabId = "interventions" | "projects" | "rate-card" | "block-afp" | "weekly-entry";

const CORE_TABS: { id: TabId; label: string }[] = [
  { id: "interventions", label: "Interventions" },
  { id: "projects", label: "Projects" },
];

const CROPFORT_TABS: { id: TabId; label: string; roles: ("spx" | "vendor" | "admin")[] }[] = [
  { id: "rate-card", label: "Rate card", roles: ["spx", "admin"] },
  { id: "block-afp", label: "Block AFP", roles: ["spx", "admin"] },
  { id: "weekly-entry", label: "Weekly entry", roles: ["spx", "vendor"] },
];

type Props = {
  active: TabId;
  basePath: string;
};

export function OperationsTabBar({ active, basePath }: Props) {
  const { isSpx, isVendor, isSystemAdmin } = useRole();

  const visibleCropfort = CROPFORT_TABS.filter((tab) => {
    if (tab.roles.includes("admin") && isSystemAdmin) return true;
    if (tab.roles.includes("spx") && isSpx) return true;
    if (tab.roles.includes("vendor") && isVendor) return true;
    return false;
  });

  const tabs = [...CORE_TABS, ...visibleCropfort];

  return (
    <nav className="mb-4 flex flex-wrap gap-1 border-b border-border/80 pb-2">
      {tabs.map((tab) => {
        const href =
          tab.id === "interventions"
            ? "/operations/interventions"
            : tab.id === "projects"
              ? "/operations/projects"
              : `${basePath}?tab=${tab.id}`;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export type { TabId };
