"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {[
          {
            href: "/operations/interventions",
            label: "Core ops",
            icon: ClipboardList,
          },
          {
            href: "/execution/field-tickets?new=1",
            label: "Log ticket",
            icon: FilePlus2,
          },
          {
            href: "/execution/work-orders",
            label: "My schedule",
            icon: ClipboardList,
          },
          {
            href: "/execution/calendar",
            label: "This week",
            icon: CalendarDays,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-3 shadow-sm active:bg-muted"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiStatCard
          label={t("dashboard.activeWorkOrders")}
          value={String(activeWo)}
          sublabel={`${upcoming} ${t("dashboard.upcoming")}`}
          icon={ClipboardList}
          tone="primary"
          loading={isLoading}
          href="/execution/work-orders"
        />
        <KpiStatCard
          label={t("dashboard.openTasks")}
          value={String(data?.myTasks?.openCount ?? 0)}
          sublabel={dueToday ? `${dueToday} ${t("dashboard.dueToday")}` : t("dashboard.onSchedule")}
          icon={FileText}
          tone="blue"
          loading={isLoading}
        />
        <KpiStatCard
          label={t("dashboard.draftTickets")}
          value={String(draftFt)}
          sublabel={t("dashboard.readyToSubmit")}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DashboardPanel title={t("dashboard.executionSummary")} viewAllHref="/execution/work-orders">
            <div className="p-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("dashboard.workOrders")}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {activeWo
                    ? `${activeWo} ${t("dashboard.activeAssignments")}`
                    : t("dashboard.noActiveWorkOrders")}
                </p>
                <Link href="/execution/work-orders" className="mt-2 inline-block text-xs text-primary hover:underline">
                  {t("dashboard.openWorkOrders")} →
                </Link>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("dashboard.fieldTickets")}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {awaitingValidation
                    ? `${awaitingValidation} ${t("dashboard.awaitingValidation")}`
                    : t("dashboard.noTicketsAwaiting")}
                </p>
                <Link href="/execution/field-tickets" className="mt-2 inline-block text-xs text-primary hover:underline">
                  {t("dashboard.openFieldTickets")} →
                </Link>
              </div>
            </div>
          </DashboardPanel>

          {data?.ownScorecard ? (
            <DashboardPanel title={t("dashboard.vendorScorecard")}>
              <div className="p-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold tabular-nums">
                    {data.ownScorecard.overallScore}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </p>
                  {data.ownScorecard.reviewPeriod ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{data.ownScorecard.reviewPeriod}</p>
                  ) : null}
                  {data.ownScorecard.qualityScore != null ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("dashboard.quality")} {data.ownScorecard.qualityScore} · {t("dashboard.timeliness")}{" "}
                      {data.ownScorecard.timelinessScore} · {t("dashboard.cost")} {data.ownScorecard.costAdherenceScore}
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
