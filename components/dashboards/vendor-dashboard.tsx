"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import { CalendarDays, ClipboardList, FilePlus2, FileText, Star, Wallet } from "lucide-react";
import Link from "next/link";

export function VendorDashboard() {
  const { t } = useVendorLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "vendor-field"],
    queryFn: () => dashboardApi.vendorField(),
  });

  const activeWo = data?.assignedWorkOrders?.currentCount ?? 0;
  const draftFt = data?.fieldTickets?.draftCount ?? 0;
  const upcoming = data?.assignedWorkOrders?.upcomingCount ?? 0;
  const dueToday = data?.myTasks?.dueTodayCount ?? 0;
  const awaitingValidation = data?.fieldTickets?.awaitingValidationCount ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {[
          { href: "/operations/interventions", label: "Core ops", icon: ClipboardList },
          { href: "/execution/field-tickets?new=1", label: "Log ticket", icon: FilePlus2 },
          { href: "/execution/work-orders", label: "Schedule", icon: ClipboardList },
          { href: "/execution/calendar", label: "Calendar", icon: CalendarDays },
          { href: "/payments/payment-requests", label: "Payments", icon: Wallet },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3 py-3 shadow-sm active:bg-primary/[0.04]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiStatCard
          label={t("dashboard.activeWorkOrders")}
          value={String(activeWo)}
          sublabel={upcoming ? `${upcoming} ${t("dashboard.upcoming")}` : undefined}
          icon={ClipboardList}
          tone="primary"
          loading={isLoading}
          href="/execution/work-orders"
        />
        <KpiStatCard
          label={t("dashboard.openTasks")}
          value={String(data?.myTasks?.openCount ?? 0)}
          sublabel={dueToday ? `${dueToday} ${t("dashboard.dueToday")}` : undefined}
          icon={FileText}
          tone="blue"
          loading={isLoading}
        />
        <KpiStatCard
          label={t("dashboard.draftTickets")}
          value={String(draftFt)}
          icon={FileText}
          tone={draftFt > 0 ? "amber" : "slate"}
          loading={isLoading}
          href="/execution/field-tickets"
        />
        <KpiStatCard
          label={t("dashboard.pendingPayments")}
          value={String(data?.paymentRequests?.pendingCount ?? 0)}
          sublabel={`${data?.paymentRequests?.verifiedCount ?? 0} ${t("dashboard.verified")}`}
          icon={Wallet}
          tone="primary"
          loading={isLoading}
          href="/payments/payment-requests"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DashboardPanel title={t("dashboard.executionSummary")} viewAllHref="/execution/work-orders" noPadding contentClassName="divide-y">
            <DashboardPanelRow href="/execution/work-orders">
              <span className="flex-1">{t("dashboard.workOrders")}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{activeWo}</span>
            </DashboardPanelRow>
            <DashboardPanelRow href="/execution/field-tickets">
              <span className="flex-1">{t("dashboard.fieldTickets")}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{awaitingValidation}</span>
            </DashboardPanelRow>
          </DashboardPanel>

          {data?.ownScorecard ? (
            <DashboardPanel title={t("dashboard.vendorScorecard")}>
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {data.ownScorecard.overallScore}
                    <span className="text-base text-muted-foreground">/100</span>
                  </p>
                  {data.ownScorecard.reviewPeriod ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{data.ownScorecard.reviewPeriod}</p>
                  ) : null}
                  {data.ownScorecard.qualityScore != null ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Q {data.ownScorecard.qualityScore} · T {data.ownScorecard.timelinessScore} · C{" "}
                      {data.ownScorecard.costAdherenceScore}
                    </p>
                  ) : null}
                </div>
              </div>
            </DashboardPanel>
          ) : null}
        </div>

        <ActionQueueCard
          title={t("dashboard.fieldActionQueue")}
          loadingLabel={t("queue.loading")}
          emptyLabel={t("queue.empty")}
        />
      </div>
    </div>
  );
}
