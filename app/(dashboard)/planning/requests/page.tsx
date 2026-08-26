"use client";

import Link from "next/link";
import { useActivityRequests, useWorkListOptions } from "@/hooks/use-activity-requests";
import { useRole } from "@/hooks/use-role";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/layout/page-shell";
import { PipelineStepper } from "@/components/planning/pipeline-stepper";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export default function ActivityRequestsPage() {
  const { isSilva, isVendor } = useRole();
  const { data: items = [], isLoading } = useActivityRequests();
  const { data: workList } = useWorkListOptions();

  return (
    <PageShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {isVendor ? "Request work" : "My activity requests"}
          </h1>
          <PipelineStepper activeIndex={0} />
          <p className="text-sm text-muted-foreground">
            Submit a need to SPX. SPX packages it into an AFE — you do not issue work orders.
          </p>
        </div>
        {(isSilva || isVendor) && (
          <Button asChild>
            <Link href="/planning/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              New request
            </Link>
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            items.map((row) => (
              <div key={row.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium truncate">{row.title}</span>
                    <StatusBadge status={row.status} />
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {row.requestType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(row.createdAt)}
                    {row.suggestedAfpLineId ? ` · AFP ${row.suggestedAfpLineId}` : ""}
                    {row.convertedAfeId ? ` · AFE ${row.convertedAfeId}` : ""}
                  </p>
                </div>
                {row.convertedAfeId ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/planning/afe/${row.convertedAfeId}`}>Open AFE</Link>
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Card>

      {workList?.workPlans?.length || workList?.catalog?.length ? (
        <Card className="p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold">This year&apos;s vendor work list</h2>
            <p className="text-xs text-muted-foreground">
              Accepted plan activities (names + AFP only). Pick from these when creating a request.
            </p>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {(workList?.catalog || []).slice(0, 40).map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{c.nameEn}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.sectionLabel} · {c.afpLineId}
                  </p>
                </div>
              </div>
            ))}
            {!workList?.catalog?.length &&
              workList?.workPlans?.map((plan) => (
                <div key={plan.id} className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {plan.budgetYearLabel}
                    {plan.farmEstateName ? ` · ${plan.farmEstateName}` : ""}
                  </p>
                  {plan.sections.flatMap((s) =>
                    s.activities.map((a) => (
                      <div key={a.id} className="text-sm border-b pb-2">
                        <p className="font-medium">{a.nameEn}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.sectionLabel} · {s.afpLineId}
                        </p>
                      </div>
                    )),
                  )}
                </div>
              ))}
          </div>
        </Card>
      ) : null}
    </PageShell>
  );
}
