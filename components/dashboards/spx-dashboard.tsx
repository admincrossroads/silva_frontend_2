"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Core ops queue"
          value={String(interventionQueue)}
          sublabel={`${coreOpsStats?.activeProjects ?? 0} active projects`}
          icon={ClipboardList}
          tone={interventionQueue > 0 ? "amber" : "slate"}
          href="/operations/interventions"
        />
        <KpiStatCard
          label="Silva AFE queue"
          value={String(pendingAfe)}
          sublabel={pendingAfe ? "Awaiting Silva decision" : "Queue clear"}
          icon={ClipboardList}
          tone="blue"
          loading={isLoading}
          href="/planning/afe"
        />
        <KpiStatCard
          label="Field tickets"
          value={String(awaitingFt)}
          sublabel="Awaiting SPX sign-off"
          icon={FileText}
          tone="amber"
          loading={isLoading}
          href="/execution/field-tickets"
        />
        <KpiStatCard
          label="Exceptions"
          value={String(exceptions)}
          sublabel="Budget, insurance, overdue"
          icon={AlertTriangle}
          tone={exceptions > 0 ? "rose" : "slate"}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          {showRevenue && data?.revenueLedgerSummary ? (
            <DashboardPanel title="Revenue ledger">
              <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">YTD</p>
                  <p className="text-lg font-semibold tabular-nums">{formatCurrency(data.revenueLedgerSummary.yearToDateUsd)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invoiced</p>
                  <p className="text-lg font-semibold tabular-nums">{formatCurrency(data.revenueLedgerSummary.invoicedUsd)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-lg font-semibold tabular-nums">{formatCurrency(data.revenueLedgerSummary.paidUsd)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="text-lg font-semibold tabular-nums">{data.revenueLedgerSummary.overdueCount}</p>
                </div>
              </div>
            </DashboardPanel>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardPanel title="Exception feed" contentClassName="divide-y max-h-64 overflow-y-auto" noPadding>
              {(data?.exceptions ?? []).length ? (
                data.exceptions.map((ex: { entityId: string; label: string; health?: string; type: string }) => (
                  <DashboardPanelRow key={`${ex.type}-${ex.entityId}`}>
                    <span className="flex-1 min-w-0 truncate">{ex.label}</span>
                    <HealthBadge health={ex.health} />
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="No exceptions — operations on track" />
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Silva pending actions"
              viewAllHref="/planning/afe"
              contentClassName="divide-y"
              noPadding
            >
              {(data?.silva?.upcomingActions ?? []).length ? (
                data.silva.upcomingActions.map((action: { entityId: string; label: string }) => (
                  <DashboardPanelRow key={action.entityId} href={`/planning/afe/${action.entityId}`}>
                    <span className="truncate">{action.label}</span>
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="No pending Silva actions" />
              )}
            </DashboardPanel>
          </div>
        </div>

        <div className="space-y-6">
          <ActionQueueCard title="Your action queue" />

          <DashboardPanel
            title="Vendor insurance"
            viewAllHref="/vendors"
            contentClassName="divide-y"
            noPadding
          >
            {(data?.vendorInsurance?.alerts ?? []).length ? (
              data.vendorInsurance.alerts.map(
                (a: { vendorId: string; name: string; insuranceExpiry: string | null }) => (
                  <DashboardPanelRow key={a.vendorId}>
                    <span className="flex-1">{a.name}</span>
                    <span className="text-muted-foreground text-xs">{a.insuranceExpiry ?? "No certificate"}</span>
                  </DashboardPanelRow>
                ),
              )
            ) : (
              <DashboardPanelEmpty message="All vendors compliant" />
            )}
          </DashboardPanel>

          <DashboardPanel title="Narrative workspace" viewAllHref="/reports/workspace">
            <div className="p-4 text-sm text-muted-foreground space-y-2">
              <p>
                Draft: {data?.reportWorkspace?.monthlyDraftId ?? "None"} ({data?.reportWorkspace?.monthlyStatus ?? "—"})
              </p>
              {data?.reportWorkspace?.needsNarrative ? (
                <p className="text-amber-700 dark:text-amber-400 font-medium">Narrative required before release.</p>
              ) : (
                <p>Write the SPX interpretive layer, then release explicitly.</p>
              )}
            </div>
          </DashboardPanel>
        </div>
      </div>

      <CropfortDashboardSection />
    </div>
  );
}
