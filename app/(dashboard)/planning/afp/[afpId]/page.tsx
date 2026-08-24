"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useAfp, useSubmitAfp, useApproveAfp } from "@/hooks/use-afps";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { ActivityCatalogPanel } from "@/components/agronomy/activity-catalog-panel";
import { AfpSchedulePanel } from "@/components/work-plan/afp-schedule-panel";
import { ActivityFeed } from "@/components/items/activity-feed";
import { exportApi, downloadBlob } from "@/lib/api/exports";
import { DetailPageHeader, PageLoading, PageShell } from "@/components/layout/page-shell";
import { formatWorkflowLabel } from "@/lib/config/procore-modules";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Check,
  Circle,
  DollarSign,
  FileText,
  Layers,
  StickyNote,
  Target,
} from "lucide-react";

const STATUS_STEPS = ["draft", "submitted", "approved", "closed"] as const;

function formatUsd(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

function formatKpi(value: string) {
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}%`;
  return trimmed;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Calendar;
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-lg border bg-muted/20 p-3", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground break-words">{value}</dd>
      </div>
    </div>
  );
}

export default function AfpDetailPage() {
  const { afpId } = useParams<{ afpId: string }>();
  const { data: afp, isLoading } = useAfp(afpId);
  const submitAfp = useSubmitAfp();
  const approveAfp = useApproveAfp();

  if (isLoading || !afp) {
    return (
      <PageShell>
        <PageLoading label="Loading budget line…" />
      </PageShell>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(afp.status as (typeof STATUS_STEPS)[number]);
  const isTerminal = afp.status === "closed";
  const canSubmit = afp.status === "draft";
  const canApprove = afp.status === "submitted";

  return (
    <PageShell>
      <DetailPageHeader
        title={afp.activity}
        backHref="/planning/afp"
        backLabel="Budget register"
        badges={
          <>
            <Badge variant="outline" className="font-normal">
              {afp.year} AFP
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] font-normal">
              {afp.id}
            </Badge>
            <StatusBadge status={afp.status} />
          </>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const blob = await exportApi.afpPdf(afp.id);
              downloadBlob(blob, `${afp.id}.pdf`);
            }}
          >
            Export PDF
          </Button>
        }
      />

      {/* Budget highlight */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Allocated budget</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">
              {formatUsd(afp.budgetAllocatedUsd)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {afp.operatingDiscipline} · {formatKpi(afp.kpiTarget)} KPI target
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 py-1">
              <Layers className="h-3 w-3" />
              Budget
            </Badge>
            <Badge variant="outline" className="gap-1 py-1 capitalize">
              {afp.operatingDiscipline}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Information */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Information
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={Calendar} label="Year" value={afp.year} />
              <InfoRow icon={Layers} label="Discipline" value={afp.operatingDiscipline} />
              <InfoRow icon={FileText} label="Activity" value={afp.activity} className="sm:col-span-2" />
              <InfoRow icon={DollarSign} label="Budget" value={formatUsd(afp.budgetAllocatedUsd)} />
              <InfoRow icon={Target} label="KPI target" value={formatKpi(afp.kpiTarget)} />
            </dl>
          </Card>

          {afp.notes ? (
            <Card className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
              </h3>
              <p className="text-sm leading-relaxed text-foreground">{afp.notes}</p>
            </Card>
          ) : null}

          <ActivityFeed entityType="afp_line" entityId={afp.id} />

          <ActivityCatalogPanel afpLineId={afp.id} />
          <AfpSchedulePanel afpLineId={afp.id} />
        </div>

        {/* Status timeline */}
        <Card className="p-5 lg:sticky lg:top-20 lg:self-start">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status timeline
          </h3>
          <ol className="relative space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const completed = idx < currentStep;
              const current = idx === currentStep;
              const isLast = idx === STATUS_STEPS.length - 1;
              return (
                <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
                  {!isLast ? (
                    <span
                      className={cn(
                        "absolute left-[9px] top-5 h-[calc(100%-4px)] w-px",
                        completed ? "bg-primary" : "bg-border",
                      )}
                      aria-hidden
                    />
                  ) : null}
                  <div
                    className={cn(
                      "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                      completed && "border-primary bg-primary text-primary-foreground",
                      current && !completed && "border-primary bg-primary/10",
                      !completed && !current && "border-muted-foreground/30 bg-background",
                    )}
                  >
                    {completed ? (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : current ? (
                      <Circle className="h-2 w-2 fill-primary text-primary" />
                    ) : null}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={cn(
                        "text-sm",
                        completed || current ? "font-semibold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {formatWorkflowLabel(step)}
                    </p>
                    {current ? (
                      <p className="mt-0.5 text-xs text-primary">Current step</p>
                    ) : completed ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">Complete</p>
                    ) : (
                      <p className="mt-0.5 text-xs text-muted-foreground">Pending</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {!isTerminal && (canSubmit || canApprove) ? (
            <div className="mt-6 space-y-2 border-t pt-4">
              {canSubmit ? (
                <Button
                  className="w-full"
                  onClick={() => submitAfp.mutate({ id: afp.id, comment: "" })}
                  disabled={submitAfp.isPending}
                >
                  {submitAfp.isPending ? "Submitting…" : "Submit for approval"}
                </Button>
              ) : null}
              {canApprove ? (
                <Button
                  className="w-full"
                  onClick={() => approveAfp.mutate({ id: afp.id, comment: "" })}
                  disabled={approveAfp.isPending}
                >
                  {approveAfp.isPending ? "Approving…" : "Approve budget line"}
                </Button>
              ) : null}
            </div>
          ) : null}

          {isTerminal ? (
            <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
              This budget line is closed. No further workflow actions are available.
            </p>
          ) : null}
        </Card>
      </div>

      {!isTerminal && (canSubmit || canApprove) ? (
        <div className="sticky bottom-0 z-10 -mx-6 flex items-center justify-end gap-2 border-t bg-background/95 px-6 py-3 backdrop-blur-sm md:hidden">
          {canSubmit ? (
            <Button
              size="sm"
              onClick={() => submitAfp.mutate({ id: afp.id, comment: "" })}
              disabled={submitAfp.isPending}
            >
              Submit
            </Button>
          ) : null}
          {canApprove ? (
            <Button
              size="sm"
              onClick={() => approveAfp.mutate({ id: afp.id, comment: "" })}
              disabled={approveAfp.isPending}
            >
              Approve
            </Button>
          ) : null}
        </div>
      ) : null}

      <AttachmentsPanel entityType="afp_line" entityId={afp.id} canUpload={afp.status === "draft"} />
    </PageShell>
  );
}
