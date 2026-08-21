"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthBadge } from "@/components/badges/health-badge";
import { ClipboardList, FileText, CreditCard, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/hooks/use-permissions";
import { formatCurrency } from "@/lib/utils/format";

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

export function SpxDashboard() {
  const { has } = usePermissions();
  const showRevenue = has("revenue_ledger.full");
  const year = new Date().getUTCFullYear();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "spx-management", year],
    queryFn: () => dashboardApi.spxManagement(year),
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Silva AFE queue"
          value={String(data?.silva?.afePipeline?.pendingSilvaApprovalCount ?? 0)}
          icon={ClipboardList}
          loading={isLoading}
        />
        <StatCard
          label="FTs awaiting sign-off"
          value={String(data?.fieldTicketQueue?.awaitingSignOffCount ?? 0)}
          icon={FileText}
          loading={isLoading}
        />
        <StatCard
          label="Monthly report"
          value={data?.reportWorkspace?.monthlyStatus ?? "None"}
          icon={CreditCard}
          loading={isLoading}
        />
        <StatCard
          label="Exceptions"
          value={String(data?.exceptions?.length ?? 0)}
          icon={AlertTriangle}
          loading={isLoading}
        />
      </div>

      {showRevenue && data?.revenueLedgerSummary ? (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue ledger summary</h3>
          <p className="text-2xs text-muted-foreground mb-3">SPX Principal only — never shared with Silva or vendors</p>
          <div className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <p className="text-muted-foreground">YTD</p>
              <p className="font-semibold">{formatCurrency(data.revenueLedgerSummary.yearToDateUsd)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Invoiced</p>
              <p className="font-semibold">{formatCurrency(data.revenueLedgerSummary.invoicedUsd)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Paid</p>
              <p className="font-semibold">{formatCurrency(data.revenueLedgerSummary.paidUsd)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Overdue</p>
              <p className="font-semibold">{data.revenueLedgerSummary.overdueCount}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Exception feed</h3>
              <p className="text-2xs text-muted-foreground">Budget, insurance, overdue sign-offs</p>
            </div>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {(data?.exceptions ?? []).length ? (
              data.exceptions.map((ex: { entityId: string; label: string; health?: string; type: string }) => (
                <div key={`${ex.type}-${ex.entityId}`} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>{ex.label}</span>
                  <HealthBadge health={ex.health} />
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No exceptions</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Narrative workspace</h3>
              <p className="text-2xs text-muted-foreground">Author before releasing to Silva</p>
            </div>
            <Button variant="ghost" size="sm" className="text-2xs gap-1" asChild>
              <Link href="/reports/monthly">
                Reports <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="px-4 py-6 text-sm text-muted-foreground space-y-2">
            <p>
              Draft: {data?.reportWorkspace?.monthlyDraftId ?? "None"} ({data?.reportWorkspace?.monthlyStatus ?? "—"})
            </p>
            {data?.reportWorkspace?.needsNarrative ? (
              <p className="text-amber-700">Narrative required before release.</p>
            ) : (
              <p>Write the SPX interpretive layer, then release explicitly.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Silva pending actions</h3>
              <p className="text-2xs text-muted-foreground">From Silva owner dashboard</p>
            </div>
            <Button variant="ghost" size="sm" className="text-2xs gap-1" asChild>
              <Link href="/planning/afe">
                AFE register <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {(data?.silva?.upcomingActions ?? []).length ? (
              data.silva.upcomingActions.map((action: { entityId: string; label: string }) => (
                <Link
                  key={action.entityId}
                  href={`/planning/afe/${action.entityId}`}
                  className="block px-4 py-2.5 text-sm hover:bg-muted/50"
                >
                  {action.label}
                </Link>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No pending Silva actions</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Vendor insurance</h3>
              <p className="text-2xs text-muted-foreground">Schedule 4 compliance</p>
            </div>
            <Button variant="ghost" size="sm" className="text-2xs gap-1" asChild>
              <Link href="/vendors">
                Vendors <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {(data?.vendorInsurance?.alerts ?? []).length ? (
              data.vendorInsurance.alerts.map(
                (a: { vendorId: string; name: string; insuranceExpiry: string | null }) => (
                  <div key={a.vendorId} className="px-4 py-2.5 text-sm flex justify-between">
                    <span>{a.name}</span>
                    <span className="text-muted-foreground">{a.insuranceExpiry ?? "No certificate"}</span>
                  </div>
                ),
              )
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">All vendors compliant</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
