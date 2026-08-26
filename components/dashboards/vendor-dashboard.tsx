"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { dashboardApi } from "@/lib/api/dashboard";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ActionQueueCard } from "@/components/dashboard/action-queue-card";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import { useRole } from "@/hooks/use-role";
import { ClipboardList, FileText, Star, Wallet, Send } from "lucide-react";

export function VendorDashboard() {
  const { t } = useVendorLocale();
  const { role } = useRole();
  const canRequest = ["vendor_admin", "vendor_manager", "vendor_field_lead"].includes(role);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "vendor-field"],
    queryFn: () => dashboardApi.vendorField(),
  });

  const activeWo = data?.assignedWorkOrders?.currentCount ?? 0;
  const draftFt = data?.fieldTickets?.draftCount ?? 0;
  const upcoming = data?.assignedWorkOrders?.upcomingCount ?? 0;
  const dueToday = data?.myTasks?.dueTodayCount ?? 0;

  return (
    <div className="space-y-6">
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

      {(canRequest || data?.workPlan) && (
        <DashboardPanel title="Planning">
          <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {data?.workPlan ? (
                <p>
                  Work plan <span className="font-medium">{data.workPlan.budgetYearLabel}</span>:{" "}
                  <span className="capitalize">{String(data.workPlan.status).replace(/_/g, " ")}</span>
                </p>
              ) : (
                <p className="text-muted-foreground">No work plan on file for this program yet.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {role === "vendor_admin" ? (
                <Link href="/execution/work-plans" className="text-xs text-primary hover:underline">
                  Work plans →
                </Link>
              ) : null}
              {canRequest ? (
                <Link
                  href="/planning/requests/new"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Send className="h-3 w-3" />
                  Request extra work
                </Link>
              ) : null}
            </div>
          </div>
        </DashboardPanel>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                </div>
              </div>
            </DashboardPanel>
          ) : (
            <DashboardPanel title={t("dashboard.executionSummary")}>
              <div className="p-4 text-sm text-muted-foreground">
                {activeWo
                  ? `${activeWo} ${t("dashboard.activeAssignments")}`
                  : t("dashboard.noActiveWorkOrders")}
              </div>
            </DashboardPanel>
          )}
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
