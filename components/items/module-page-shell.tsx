"use client";

import type { ReactNode } from "react";
import type { ProcoreModuleId } from "@/lib/config/procore-modules";
import { PROCORE_MODULES, procorePageTitle } from "@/lib/config/procore-modules";
import { PageShell, PageHeader, PageFilters, PageContent } from "@/components/layout/page-shell";
import { ViewSwitcher } from "./view-switcher";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import { Badge } from "@/components/ui/badge";

type ModulePageShellProps = {
  moduleId: ProcoreModuleId;
  title?: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  view: ModuleViewMode;
  onViewChange: (view: ModuleViewMode) => void;
  viewModes?: ModuleViewMode[];
  children: ReactNode;
};

/** Procore-style module page: tool label + instrument name + board/table toggle */
export function ModulePageShell({
  moduleId,
  title,
  description,
  actions,
  filters,
  view,
  onViewChange,
  viewModes,
  children,
}: ModulePageShellProps) {
  const mod = PROCORE_MODULES[moduleId];
  const modes = viewModes ?? mod.views ?? ["table"];

  return (
    <PageShell>
      <PageHeader
        title={title ?? mod.instrumentLabel}
        description={description}
        badge={
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {mod.procoreLabel}
          </Badge>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {modes.length > 1 ? (
              <ViewSwitcher value={view} onChange={onViewChange} modes={modes} />
            ) : null}
            {actions}
          </div>
        }
      />
      {filters ? <PageFilters>{filters}</PageFilters> : null}
      <PageContent>{children}</PageContent>
    </PageShell>
  );
}

export { procorePageTitle };
