"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText, Wallet, ChevronRight } from "lucide-react";
import Link from "next/link";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: any;
  loading: boolean;
}) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        {loading ? (
          <div className="h-7 w-12 bg-muted rounded animate-pulse mt-1" />
        ) : (
          <p className="stat-value text-xl">{value}</p>
        )}
      </div>
    </Card>
  );
}

export function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "vendor-field"],
    queryFn: () => dashboardApi.vendorField(),
  });

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Field workspace: your Work Orders, Field Tickets, Payment Requests, and scorecard only. SPX fees and Silva
        budgets are not visible here.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active work orders"
          value={String(data?.assignedWorkOrders?.currentCount ?? 0)}
          icon={ClipboardList}
          loading={isLoading}
        />
        <StatCard
          label="Open tasks"
          value={String(data?.myTasks?.openCount ?? 0)}
          icon={FileText}
          loading={isLoading}
        />
        <StatCard
          label="Draft tickets"
          value={String(data?.fieldTickets?.draftCount ?? 0)}
          icon={FileText}
          loading={isLoading}
        />
        <StatCard
          label="Pending payments"
          value={String(data?.paymentRequests?.pendingCount ?? 0)}
          icon={Wallet}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-foreground">Work orders</h3>
            <Button variant="ghost" size="sm" className="text-2xs gap-1" asChild>
              <Link href="/execution/work-orders">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="px-4 py-6 text-sm text-muted-foreground">
            {data?.assignedWorkOrders?.currentCount
              ? `${data.assignedWorkOrders.currentCount} active, ${data.assignedWorkOrders.upcomingCount} upcoming`
              : "No active work orders — wait for SPX to issue a Work Order before starting work."}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-foreground">Field tickets</h3>
            <Button variant="ghost" size="sm" className="text-2xs gap-1" asChild>
              <Link href="/execution/field-tickets">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="px-4 py-6 text-sm text-muted-foreground">
            Submit → supervisor review → SPX validation unlocks Payment Requests.
            {data?.fieldTickets?.awaitingValidationCount
              ? ` ${data.fieldTickets.awaitingValidationCount} awaiting SPX validation.`
              : " No tickets awaiting validation."}
          </div>
        </Card>
      </div>

      {data?.ownScorecard ? (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground">Your Vendor Scorecard</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.ownScorecard.reviewPeriod}: overall {data.ownScorecard.overallScore}/100
            {data.ownScorecard.qualityScore != null && (
              <>
                {" "}
                (Q {data.ownScorecard.qualityScore} · T {data.ownScorecard.timelinessScore} · C{" "}
                {data.ownScorecard.costAdherenceScore})
              </>
            )}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
