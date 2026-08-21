"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { BAND_COLORS } from "@/lib/utils/constants";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual-chart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthBadge } from "@/components/badges/health-badge";
import { DollarSign, TrendingUp, FileCheck, CreditCard, ChevronRight, Wheat } from "lucide-react";
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
      <div className="min-w-0">
        <p className="stat-label">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-muted rounded animate-pulse mt-1" />
        ) : (
          <p className="stat-value text-xl">{value}</p>
        )}
      </div>
    </Card>
  );
}

export function SilvaDashboard() {
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "silva-owner", year],
    queryFn: () => dashboardApi.silvaOwner(year),
  });

  const bvaChartData =
    data?.budgetVsActual?.lines?.map((line: { afpLineId: string; utilizationPercent: number }) => ({
      discipline: line.afpLineId,
      budget: 100,
      actual: line.utilizationPercent,
    })) ?? [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="AFEs Pending"
          value={String(data?.afePipeline?.pendingSilvaApprovalCount ?? 0)}
          icon={FileCheck}
          loading={isLoading}
        />
        <StatCard
          label="Oldest outstanding"
          value={`${data?.afePipeline?.oldestDaysOutstanding ?? 0} days`}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard
          label="Vendor alerts"
          value={String(data?.vendorPerformance?.belowThresholdCount ?? 0)}
          icon={CreditCard}
          loading={isLoading}
        />
        <StatCard
          label="Picker productivity"
          value={String(data?.harvestKpis?.pickerProductivityCurrent ?? "—")}
          icon={Wheat}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">AFE Approval Queue</h3>
              <p className="text-2xs text-muted-foreground">Band C/D requiring Silva written approval</p>
            </div>
            <Button variant="ghost" size="sm" className="text-2xs gap-1" asChild>
              <Link href="/planning/afe">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-5 w-14 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                </div>
              ))
            ) : data?.afePipeline?.items?.length ? (
              data.afePipeline.items.map(
                (afe: { id: string; band: string; estimatedCostUsd: number; health?: string }) => (
                  <Link
                    key={afe.id}
                    href={`/planning/afe/${afe.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <span
                      className={`badge ${BAND_COLORS[afe.band]?.bg ?? "bg-muted"} ${BAND_COLORS[afe.band]?.text ?? ""}`}
                    >
                      Band {afe.band}
                    </span>
                    <span className="flex-1 truncate text-sm text-foreground">{afe.id}</span>
                    <HealthBadge health={afe.health} />
                    <span className="text-sm font-mono font-medium text-foreground">
                      {formatCurrency(afe.estimatedCostUsd)}
                    </span>
                  </Link>
                ),
              )
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No AFEs pending</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-foreground">Budget utilization</h3>
            <p className="text-2xs text-muted-foreground">By AFP line — {year}</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="h-[280px] bg-muted/50 rounded animate-pulse" />
            ) : bvaChartData.length > 0 ? (
              <>
                <BudgetVsActualChart data={bvaChartData} />
                <div className="space-y-1">
                  {(data?.budgetVsActual?.lines ?? []).slice(0, 5).map(
                    (line: { afpLineId: string; utilizationPercent: number; health?: string }) => (
                      <div key={line.afpLineId} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{line.afpLineId}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{line.utilizationPercent}%</span>
                          <HealthBadge health={line.health} />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No budget data</p>
            )}
          </div>
        </Card>
      </div>

      {(data?.upcomingActions?.length ?? 0) > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">Upcoming Silva actions</h3>
          <ul className="space-y-1">
            {data.upcomingActions.map((a: { entityId: string; label: string; health?: string }) => (
              <li key={a.entityId} className="flex items-center justify-between text-sm">
                <Link href={`/planning/afe/${a.entityId}`} className="text-primary hover:underline">
                  {a.label}
                </Link>
                <HealthBadge health={a.health} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Released reports</h3>
          <p className="text-2xs text-muted-foreground">
            Monthly ready: {data?.reports?.monthlyReady ? "Yes" : "No"} · Yield vs baseline:{" "}
            {data?.harvestKpis?.yieldTrendVsBaselinePercent ?? 0}%
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reports/monthly">Open reports</Link>
        </Button>
      </Card>
    </div>
  );
}
