"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { DashboardStatGrid } from "@/components/dashboard/dashboard-stat-grid";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
import { ValidationQueuePanel } from "@/components/cropfort/validation-queue-panel";
import { useCoreOperationStats } from "@/hooks/use-ad-hoc-requests";
import { ClipboardList, FileText, AlertTriangle } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { formatCurrency } from "@/lib/utils/format";

export function SpxDashboard() {
  const { has } = usePermissions();
  const showRevenue = has("revenue_ledger.full");
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "spx-management", year],
    queryFn: () => dashboardApi.spxManagement(year),
  });

  const pendingAfe = data?.silva?.afePipeline?.pendingSilvaApprovalCount ?? 0;
  const awaitingFt = data?.fieldTicketQueue?.awaitingSignOffCount ?? 0;
  const exceptions = data?.exceptions?.length ?? 0;
  const { data: coreOpsStats } = useCoreOperationStats();
  const interventionQueue =
    (coreOpsStats?.submittedInterventions ?? 0) + (coreOpsStats?.submittedProjects ?? 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Core ops"
          value={String(interventionQueue)}
          sublabel={coreOpsStats?.activeProjects ? `${coreOpsStats.activeProjects} active` : undefined}
          icon={ClipboardList}
          tone={interventionQueue > 0 ? "amber" : "slate"}
          href="/operations/interventions"
        />
        <KpiStatCard
          label="Silva AFE"
          value={String(pendingAfe)}
          icon={ClipboardList}
          tone="blue"
          loading={isLoading}
          href="/planning/afe"
        />
        <KpiStatCard
          label="Field tickets"
          value={String(awaitingFt)}
          icon={FileText}
          tone="amber"
          loading={isLoading}
          href="/execution/field-tickets"
        />
        <KpiStatCard
          label="Exceptions"
          value={String(exceptions)}
          icon={AlertTriangle}
          tone={exceptions > 0 ? "rose" : "slate"}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {showRevenue && data?.revenueLedgerSummary ? (
            <DashboardPanel title="Revenue ledger" viewAllHref="/reports/revenue">
              <DashboardStatGrid
                items={[
                  { label: "YTD", value: formatCurrency(data.revenueLedgerSummary.yearToDateEtb) },
                  { label: "Invoiced", value: formatCurrency(data.revenueLedgerSummary.invoicedEtb) },
                  { label: "Paid", value: formatCurrency(data.revenueLedgerSummary.paidEtb) },
                  { label: "Overdue", value: String(data.revenueLedgerSummary.overdueCount) },
                ]}
              />
            </DashboardPanel>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DashboardPanel title="Exceptions" contentClassName="max-h-64 divide-y overflow-y-auto" noPadding>
              {(data?.exceptions ?? []).length ? (
                data.exceptions.map((ex: { entityId: string; label: string; health?: string; type: string }) => (
                  <DashboardPanelRow key={`${ex.type}-${ex.entityId}`}>
                    <span className="min-w-0 flex-1 truncate">{ex.label}</span>
                    <HealthBadge health={ex.health} />
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="None" />
              )}
            </DashboardPanel>

            <DashboardPanel title="Silva actions" viewAllHref="/planning/afe" contentClassName="divide-y" noPadding>
              {(data?.silva?.upcomingActions ?? []).length ? (
                data.silva.upcomingActions.map((action: { entityId: string; label: string }) => (
                  <DashboardPanelRow key={action.entityId} href={`/planning/afe/${action.entityId}`}>
                    <span className="truncate">{action.label}</span>
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="None" />
              )}
            </DashboardPanel>
          </div>
        </div>

        <div className="space-y-4">
          <ActionQueueCard title="Action queue" />
          <ValidationQueuePanel />

          <DashboardPanel title="Vendor insurance" viewAllHref="/vendors" contentClassName="divide-y" noPadding>
            {(data?.vendorInsurance?.alerts ?? []).length ? (
              data.vendorInsurance.alerts.map(
                (a: { vendorId: string; name: string; insuranceExpiry: string | null }) => (
                  <DashboardPanelRow key={a.vendorId}>
                    <span className="flex-1">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.insuranceExpiry ?? "—"}</span>
                  </DashboardPanelRow>
                ),
              )
            ) : (
              <DashboardPanelEmpty message="None" />
            )}
          </DashboardPanel>

          <DashboardPanel title="Narrative" viewAllHref="/reports/workspace" noPadding contentClassName="divide-y">
            <DashboardPanelRow href="/reports/workspace">
              <span className="flex-1">Monthly draft</span>
              <span className="text-xs text-muted-foreground">
                {data?.reportWorkspace?.monthlyStatus ?? "—"}
              </span>
            </DashboardPanelRow>
            {data?.reportWorkspace?.needsNarrative ? (
              <div className="px-4 py-2.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Narrative required
              </div>
            ) : null}
          </DashboardPanel>
        </div>
      </div>

      <CropfortDashboardSection />
    </div>
  );
}
