"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Building2, Layers, Shield } from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import { platformApi } from "@/lib/api/platform";
import { programApi } from "@/lib/api/auth";
import { useAuth } from "@/hooks/use-auth";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-white/70 p-4 backdrop-blur-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-12 animate-pulse rounded bg-muted" />
        ) : (
          <p className="stat-value text-xl">{value}</p>
        )}
      </div>
    </div>
  );
}

export function SystemAdminDashboard() {
  const { tenant, activeProgram, programs } = useAuth();
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

  const programCount = programList?.length ?? programs?.length ?? 0;
  const exceptionCount = Array.isArray(spx?.exceptions) ? spx.exceptions.length : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {tenant?.displayName || "Platform"}
        {activeProgram ? ` · ${activeProgram.name}` : ""}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Organizations" value={String(orgCount)} icon={Building2} loading={orgsLoading} />
        <StatCard label="Your programs" value={String(programCount)} icon={Layers} loading={programsLoading} />
        <StatCard label="Exceptions" value={String(exceptionCount)} icon={Shield} loading={spxLoading} />
      </div>

      {exceptionCount > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground">Active program exceptions</h3>
          <ul className="mt-3 space-y-2">
            {spx.exceptions.slice(0, 5).map((ex: { type?: string; label?: string; entityId?: string }, i: number) => (
              <li key={`${ex.entityId || i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{ex.label || ex.type || "Exception"}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/settings">Admin overview</Link>
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
