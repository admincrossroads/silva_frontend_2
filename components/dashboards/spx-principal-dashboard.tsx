"use client";

import { useRole } from "@/hooks/use-role";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { registrationApi, registrationStatusLabel } from "@/lib/api/registration";
import { contactApi } from "@/lib/api/contact";
import { farmEstatesApi } from "@/lib/api/farm-estates";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { DashboardStatGrid } from "@/components/dashboard/dashboard-stat-grid";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
import { useCoreOperationStats } from "@/hooks/use-ad-hoc-requests";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import {
  ClipboardList,
  FileText,
  CreditCard,
  AlertTriangle,
  ClipboardCheck,
  Mail,
  MapPin,
  Wallet,
} from "lucide-react";

function orgTypeLabel(orgType: string) {
  if (orgType === "silva") return "Asset owner";
  if (orgType === "vendor") return "Vendor";
  return orgType;
}

export function SpxPrincipalDashboard() {
  const { isSystemAdmin } = useRole();
  const year = new Date().getUTCFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "spx-management", year],
    queryFn: () => dashboardApi.spxManagement(year),
  });

  const { data: pendingRegs, isLoading: regsLoading } = useQuery({
    queryKey: ["dashboard", "registrations", "pending_activation"],
    queryFn: () => registrationApi.list({ lifecycle: "pending_activation" }),
  });

  const { data: draftRegs, isLoading: draftRegsLoading } = useQuery({
    queryKey: ["dashboard", "registrations", "draft"],
    queryFn: () => registrationApi.list({ lifecycle: "draft" }),
  });

  const { data: newContact, isLoading: contactLoading } = useQuery({
    queryKey: ["dashboard", "contact", "new"],
    queryFn: () => contactApi.list({ status: "new", pageSize: 5 }),
  });

  const { data: estates, isLoading: estatesLoading } = useQuery({
    queryKey: ["dashboard", "farm-estates"],
    queryFn: () => farmEstatesApi.list({ status: "active" }),
  });

  const pendingRegCount =
    (pendingRegs?.meta?.total ?? pendingRegs?.items?.length ?? 0) +
    (draftRegs?.meta?.total ?? draftRegs?.items?.length ?? 0);

  const registrationPreview = [...(pendingRegs?.items ?? []), ...(draftRegs?.items ?? [])].slice(0, 5);

  const newContactCount = newContact?.items?.length ?? 0;
  const estateCount = estates?.length ?? 0;

  const pendingAfe = data?.silva?.afePipeline?.pendingSilvaApprovalCount ?? 0;
  const awaitingFt = data?.fieldTicketQueue?.awaitingSignOffCount ?? 0;
  const exceptions = data?.exceptions?.length ?? 0;
  const { data: coreOpsStats } = useCoreOperationStats();
  const coreOpsQueue =
    (coreOpsStats?.submittedInterventions ?? 0) + (coreOpsStats?.submittedProjects ?? 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Activations"
          value={String(pendingRegCount)}
          icon={ClipboardCheck}
          tone={pendingRegCount > 0 ? "amber" : "slate"}
          loading={regsLoading || draftRegsLoading}
          href="/settings/registrations"
        />
        <KpiStatCard
          label="Contact inbox"
          value={String(newContactCount)}
          icon={Mail}
          tone={newContactCount > 0 ? "blue" : "slate"}
          loading={contactLoading}
          href="/settings/contact"
        />
        <KpiStatCard
          label="Farm estates"
          value={String(estateCount)}
          icon={MapPin}
          tone="primary"
          loading={estatesLoading}
          href="/settings/farm-estates"
        />
        {isSystemAdmin ? (
          <KpiStatCard
            label="Organizations"
            value="All"
            icon={Wallet}
            tone="primary"
            href="/settings/organization"
          />
        ) : (
          <KpiStatCard
            label="Revenue YTD"
            value={formatCurrency(data?.revenueLedgerSummary?.yearToDateEtb ?? 0)}
            sublabel={data?.revenueLedgerSummary?.overdueCount ? `${data.revenueLedgerSummary.overdueCount} overdue` : undefined}
            icon={Wallet}
            tone="primary"
            loading={isLoading}
            href="/reports/revenue"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiStatCard
          label="Core ops"
          value={String(coreOpsQueue)}
          icon={ClipboardList}
          tone={coreOpsQueue > 0 ? "amber" : "slate"}
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
          label="Monthly report"
          value={data?.reportWorkspace?.monthlyStatus ?? "—"}
          icon={CreditCard}
          tone="primary"
          loading={isLoading}
          href="/reports/workspace"
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
          {!isSystemAdmin && data?.revenueLedgerSummary ? (
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardPanel
              title="Registrations"
              viewAllHref="/settings/registrations"
              contentClassName="divide-y max-h-64 overflow-y-auto"
              noPadding
            >
              {registrationPreview.length ? (
                registrationPreview.map((req) => (
                  <DashboardPanelRow key={req.id} href="/settings/registrations">
                    <span className="flex-1 min-w-0 truncate">{req.orgName}</span>
                    <Badge variant="outline" className="shrink-0 text-2xs">
                      {orgTypeLabel(req.orgType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {registrationStatusLabel(req)}
                    </span>
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="None" />
              )}
            </DashboardPanel>

            <DashboardPanel
              title="Exception feed"
              contentClassName="divide-y max-h-64 overflow-y-auto"
              noPadding
            >
              {(data?.exceptions ?? []).length ? (
                data.exceptions.map((ex: { entityId: string; label: string; health?: string; type: string }) => (
                  <DashboardPanelRow key={`${ex.type}-${ex.entityId}`}>
                    <span className="flex-1 min-w-0 truncate">{ex.label}</span>
                    <HealthBadge health={ex.health} />
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="None" />
              )}
            </DashboardPanel>
          </div>

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
              <DashboardPanelEmpty message="None" />
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-4">
          <ActionQueueCard title="Action queue" />

          <DashboardPanel
            title="Contact inbox"
            viewAllHref="/settings/contact"
            contentClassName="divide-y max-h-48 overflow-y-auto"
            noPadding
          >
            {(newContact?.items ?? []).length ? (
              (newContact?.items ?? []).map((msg) => (
                <DashboardPanelRow key={msg.id} href="/settings/contact">
                  <span className="flex-1 min-w-0 truncate">{msg.subject}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{msg.name}</span>
                </DashboardPanelRow>
              ))
            ) : (
              <DashboardPanelEmpty message="None" />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Farm estates"
            viewAllHref="/settings/farm-estates"
            contentClassName="divide-y"
            noPadding
          >
            {(estates ?? []).length ? (
              (estates ?? []).slice(0, 5).map((estate) => (
                <DashboardPanelRow key={estate.id} href="/settings/farm-estates">
                  <span className="flex-1 truncate">{estate.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {estate.vendors.length} vendor{estate.vendors.length !== 1 ? "s" : ""}
                  </span>
                </DashboardPanelRow>
              ))
            ) : (
              <DashboardPanelEmpty message="None" />
            )}
          </DashboardPanel>

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
