"use client";

import { useRole } from "@/hooks/use-role";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { registrationApi } from "@/lib/api/registration";
import { contactApi } from "@/lib/api/contact";
import { farmEstatesApi } from "@/lib/api/farm-estates";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { HealthBadge } from "@/components/badges/health-badge";
import { CropfortDashboardSection } from "@/components/dashboards/cropfort-dashboard-section";
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

  const { data: submittedRegs, isLoading: regsLoading } = useQuery({
    queryKey: ["dashboard", "registrations", "submitted"],
    queryFn: () => registrationApi.list({ status: "submitted" }),
  });

  const { data: reviewRegs, isLoading: reviewRegsLoading } = useQuery({
    queryKey: ["dashboard", "registrations", "under_review"],
    queryFn: () => registrationApi.list({ status: "under_review" }),
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
    (submittedRegs?.meta?.total ?? submittedRegs?.items?.length ?? 0) +
    (reviewRegs?.meta?.total ?? reviewRegs?.items?.length ?? 0);

  const registrationPreview = [
    ...(submittedRegs?.items ?? []),
    ...(reviewRegs?.items ?? []),
  ].slice(0, 5);

  const newContactCount = newContact?.items?.length ?? 0;
  const estateCount = estates?.length ?? 0;

  const pendingAfe = data?.silva?.afePipeline?.pendingSilvaApprovalCount ?? 0;
  const awaitingFt = data?.fieldTicketQueue?.awaitingSignOffCount ?? 0;
  const exceptions = data?.exceptions?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard
          label="Registration queue"
          value={String(pendingRegCount)}
          sublabel={pendingRegCount ? "Applications awaiting review" : "Queue clear"}
          icon={ClipboardCheck}
          tone={pendingRegCount > 0 ? "amber" : "slate"}
          loading={regsLoading || reviewRegsLoading}
          href="/settings/registrations"
        />
        <KpiStatCard
          label="Contact inbox"
          value={String(newContactCount)}
          sublabel={newContactCount ? "Unread landing-page messages" : "Inbox clear"}
          icon={Mail}
          tone={newContactCount > 0 ? "blue" : "slate"}
          loading={contactLoading}
          href="/settings/contact"
        />
        <KpiStatCard
          label="Farm estates"
          value={String(estateCount)}
          sublabel="Active areas in program"
          icon={MapPin}
          tone="primary"
          loading={estatesLoading}
          href="/settings/farm-estates"
        />
        {isSystemAdmin ? (
          <KpiStatCard
            label="Platform scope"
            value="All orgs"
            sublabel="System administrator view"
            icon={Wallet}
            tone="primary"
            href="/settings/organization"
          />
        ) : (
          <KpiStatCard
            label="Revenue YTD"
            value={formatCurrency(data?.revenueLedgerSummary?.yearToDateUsd ?? 0)}
            sublabel={`${data?.revenueLedgerSummary?.overdueCount ?? 0} overdue · SPX fee ledger`}
            icon={Wallet}
            tone="primary"
            loading={isLoading}
            href="/reports/revenue"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          label="Monthly report"
          value={data?.reportWorkspace?.monthlyStatus ?? "None"}
          sublabel={data?.reportWorkspace?.needsNarrative ? "Narrative required" : "Report workspace"}
          icon={CreditCard}
          tone="primary"
          loading={isLoading}
          href="/reports/workspace"
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
          {!isSystemAdmin && data?.revenueLedgerSummary ? (
            <DashboardPanel title="Revenue ledger" viewAllHref="/reports/revenue">
              <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">YTD</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(data.revenueLedgerSummary.yearToDateUsd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invoiced</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(data.revenueLedgerSummary.invoicedUsd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(data.revenueLedgerSummary.paidUsd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="text-lg font-semibold tabular-nums">{data.revenueLedgerSummary.overdueCount}</p>
                </div>
              </div>
            </DashboardPanel>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardPanel
              title="Registration review"
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
                    <span className="text-xs text-muted-foreground shrink-0 capitalize">{req.status.replace("_", " ")}</span>
                  </DashboardPanelRow>
                ))
              ) : (
                <DashboardPanelEmpty message="No pending registration applications" />
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
                <DashboardPanelEmpty message="No exceptions — operations on track" />
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
              <DashboardPanelEmpty message="No pending Silva actions" />
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <ActionQueueCard title="Your action queue" />

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
              <DashboardPanelEmpty message="No unread contact messages" />
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
              <DashboardPanelEmpty message="No farm estates configured yet" />
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
