"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { Inbox, ClipboardList, FileText, CreditCard } from "lucide-react";

export function SpxDashboard() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "spx-management", year],
    queryFn: () => dashboardApi.spxManagement(year),
  });

  const intake = data?.intakeQueue?.awaitingTriageCount ?? 0;
  const pendingAfe = data?.silva?.afePipeline?.pendingSilvaApprovalCount ?? 0;
  const awaitingFt = data?.fieldTicketQueue?.awaitingSignOffCount ?? 0;
  const exceptions = data?.exceptions?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Intake waiting"
          value={String(intake)}
          sublabel="Requests to triage"
          icon={Inbox}
          tone={intake > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/planning/intake"
        />
        <KpiStatCard
          label="Silva C/D queue"
          value={String(pendingAfe)}
          sublabel={pendingAfe ? "Awaiting Silva" : "Queue clear"}
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
          label="Monthly report"
          value={data?.reportWorkspace?.monthlyStatus ?? "None"}
          sublabel={data?.reportWorkspace?.needsNarrative ? "Narrative required" : "Report workspace"}
          icon={CreditCard}
          tone="primary"
          loading={isLoading}
          href="/reports/workspace"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardPanel title="Exceptions" contentClassName="divide-y max-h-72 overflow-y-auto" noPadding>
            {(data?.exceptions ?? []).length ? (
              data.exceptions.map((ex: { entityId: string; label: string; health?: string; type: string }) => (
                <DashboardPanelRow key={`${ex.type}-${ex.entityId}`}>
                  <span className="flex-1 min-w-0 truncate">{ex.label}</span>
                  <HealthBadge health={ex.health} />
                </DashboardPanelRow>
              ))
            ) : (
              <DashboardPanelEmpty message={exceptions === 0 ? "No exceptions — operations on track" : "—"} />
            )}
          </DashboardPanel>
        </div>
        <ActionQueueCard title="Your action queue" />
      </div>
    </div>
  );
}
