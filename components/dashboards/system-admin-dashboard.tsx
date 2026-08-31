"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Building2, Layers, Shield } from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import { platformApi } from "@/lib/api/platform";
import { programApi } from "@/lib/api/auth";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { Button } from "@/components/ui/button";

export function SystemAdminDashboard() {
  const year = new Date().getUTCFullYear();

  const { data: spx, isLoading: spxLoading } = useQuery({
    queryKey: ["dashboard", "spx-management", year],
    queryFn: () => dashboardApi.spxManagement(year),
  });

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: ["admin", "organizations"],
    queryFn: () => platformApi.listOrganizations({ pageSize: 100 }),
  });

  const { data: programList, isLoading: programsLoading } = useQuery({
    queryKey: ["admin", "programs"],
    queryFn: () => programApi.list(),
  });

  const orgCount = useMemo(() => {
    if (Array.isArray(orgs)) return orgs.length;
    return orgs?.items?.length ?? 0;
  }, [orgs]);

  const programCount = programList?.length ?? 0;
  const exceptionCount = Array.isArray(spx?.exceptions) ? spx.exceptions.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiStatCard label="Organizations" value={String(orgCount)} icon={Building2} loading={orgsLoading} href="/settings/organization" />
        <KpiStatCard label="Programs" value={String(programCount)} icon={Layers} loading={programsLoading} />
        <KpiStatCard
          label="Exceptions"
          value={String(exceptionCount)}
          icon={Shield}
          tone={exceptionCount > 0 ? "amber" : "slate"}
          loading={spxLoading}
        />
      </div>

      {exceptionCount > 0 ? (
        <DashboardPanel title="Exceptions" noPadding contentClassName="divide-y max-h-48 overflow-y-auto">
          {spx.exceptions.slice(0, 5).map((ex: { type?: string; label?: string; entityId?: string }, i: number) => (
            <DashboardPanelRow key={`${ex.entityId || i}`}>
              <span className="min-w-0 flex-1 truncate">{ex.label || ex.type || "Exception"}</span>
            </DashboardPanelRow>
          ))}
        </DashboardPanel>
      ) : (
        <DashboardPanel title="Exceptions">
          <DashboardPanelEmpty message="None" />
        </DashboardPanel>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/settings">Settings</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/settings/organization">Organizations</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/settings/profile">Profile</Link>
        </Button>
      </div>

      <CropfortDashboardSection />
    </div>
  );
}
