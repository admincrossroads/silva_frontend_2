"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileSpreadsheet, Keyboard, CheckCircle2, Upload } from "lucide-react";
import {
  useWorkPlan,
  useSubmitWorkPlan,
  useAcceptWorkPlan,
  useRejectWorkPlan,
  useUploadWorkPlan,
  useWorkPlanTemplate,
  useUpdateWorkPlan,
  useUpdateWorkPlanMeta,
} from "@/hooks/use-work-plans";
import { useVendorFarmEstates } from "@/hooks/use-vendor-farm-estates";
import { useRole } from "@/hooks/use-role";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, PageLoading } from "@/components/layout/page-shell";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { EntityMessagesPanel } from "@/components/messages/entity-messages-panel";
import { WorkPlanBuilder } from "@/components/work-plan/work-plan-builder";
import { WorkPlanSetupForm } from "@/components/work-plan/work-plan-setup-form";
import { cn } from "@/lib/utils";
import type { ParsedWorkPlan } from "@/lib/work-plan/builder";

type ParsedCategory = {
  afpLineId: string;
  activity: string;
  budgetEtb: number;
};

type ParsedPlan = ParsedWorkPlan & {
  categories?: ParsedCategory[];
  matchedSheets?: string[];
  workbookSheets?: string[];
  sections?: Array<{
    sectionCode?: string;
    sectionLabel: string;
    activities: Array<{
      id: string;
      nameEn: string;
      annualMandays?: number | null;
      annualCostEtb?: number | null;
      schedule?: Array<{ month: number; quantity?: number }>;
    }>;
  }>;
};

type BuildMode = "choose" | "form" | "excel" | "summary";

export default function WorkPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadSectionCode, setUploadSectionCode] = useState("");
  const { canManageWorkPlan, isSpx } = useRole();
  const { data: plan, isLoading } = useWorkPlan(id);
  const { data: template, isLoading: templateLoading } = useWorkPlanTemplate();
  const {
    estates,
    isLoading: estatesLoading,
    reason: estatesReason,
    tenantName,
  } = useVendorFarmEstates({ status: "active" });
  const submitPlan = useSubmitWorkPlan();
  const acceptPlan = useAcceptWorkPlan();
  const rejectPlan = useRejectWorkPlan();
  const uploadPlan = useUploadWorkPlan();
  const updatePlan = useUpdateWorkPlan();
  const updateMeta = useUpdateWorkPlanMeta();

  const parsed = (plan?.parsedJson || {}) as ParsedPlan;
  const hasActivities = (parsed.categories?.length || parsed.sections?.length || 0) > 0;
  const [mode, setMode] = useState<BuildMode>("choose");

  useEffect(() => {
    if (!plan) return;
    if (parsed.inputMethod === "excel" && hasActivities) setMode("summary");
    else if (hasActivities) setMode("form");
    else setMode("choose");
    // Only when opening a plan
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  if (isLoading || !plan) {
    return (
      <PageShell>
        <PageLoading label="Loading work plan…" />
      </PageShell>
    );
  }

  const canEdit = canManageWorkPlan && ["draft", "revision_requested"].includes(plan.status);
  const canSubmit = canEdit && Boolean(plan.farmEstateId) && hasActivities;
  // SPX manages plans end-to-end — promote from draft when activities are ready
  const canPromote =
    isSpx &&
    ["draft", "revision_requested", "submitted"].includes(plan.status) &&
    Boolean(plan.farmEstateId) &&
    hasActivities;
  const canReview = isSpx && plan.status === "submitted";
  const farmBlockCodes =
    plan.farmEstate?.blocks?.map((b) => b.code) ??
    estates.find((e) => e.id === plan.farmEstateId)?.blocks.map((b) => b.code) ??
    [];

  const onUploadFile = (file: File) => {
    if (!uploadSectionCode) {
      setUploadError("Select which operation this Excel is for before uploading.");
      return;
    }
    setUploadError(null);
    setUploadFileName(file.name);
    uploadPlan.mutate(
      { id: plan.id, file, sectionCode: uploadSectionCode },
      {
        onSuccess: () => {
          setMode("summary");
        },
        onError: (err) => {
          setUploadError(getApiErrorMessage(err, "Could not read this Excel file."));
        },
      },
    );
  };

  return (
    <PageShell>
      <div className="mb-6">
        <Link href="/execution/work-plans" className="text-sm text-muted-foreground hover:text-foreground">
          ← Plan builder
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{plan.farmName || "Work plan"}</h1>
            <Badge variant="outline" className="capitalize">
              {plan.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <StartMessageButton
            entityType="work_plan_submission"
            entityId={plan.id}
            label={plan.farmName || "Work plan"}
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.budgetYearLabel} · {plan.vendor?.name}
          {plan.totalAreaHa != null ? ` · ${plan.totalAreaHa} ha` : null}
        </p>
        {plan.reviewNotes ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {plan.reviewNotes}
          </p>
        ) : null}
      </div>

      {canReview || canPromote ? (
        <Card className="mb-6 p-5">
          <h2 className="text-sm font-semibold">Annual plan drafts</h2>
          <Textarea
            label="Notes"
            className="mt-3"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Optional notes"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={acceptPlan.isPending || !canPromote}
              onClick={() =>
                acceptPlan.mutate(
                  { id: plan.id, notes: reviewNotes || undefined },
                  {
                    onSuccess: (data) => {
                      const href = data?.promote?.annualPlanHref || `/planning/afp?year=${plan.budgetYearGc}`;
                      router.push(href);
                    },
                  },
                )
              }
            >
              {acceptPlan.isPending ? "Creating drafts…" : "Accept → Annual plan drafts"}
            </Button>
            {canReview ? (
              <Button
                variant="destructive"
                disabled={rejectPlan.isPending}
                onClick={() => rejectPlan.mutate({ id: plan.id, notes: reviewNotes || "Rejected." })}
              >
                Reject
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {plan.status === "accepted" && plan.promotedAt ? (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Annual plan
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href={`/planning/afp?year=${plan.budgetYearGc}`}>Open</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Step 1 — farm details */}
      <Card className="mb-6 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            1
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Farm & budget year</h2>
            <div className="mt-4">
              <WorkPlanSetupForm
                estates={estates}
                estatesLoading={estatesLoading}
                estatesReason={estatesReason}
                tenantName={tenantName}
                template={template}
                readOnly={!canEdit}
                isPending={updateMeta.isPending}
                initial={{
                  farmEstateId: plan.farmEstateId ?? undefined,
                  farmName: plan.farmName ?? plan.farmEstate?.name ?? undefined,
                  totalAreaHa: plan.totalAreaHa ?? undefined,
                  budgetYearLabel: plan.budgetYearLabel,
                  budgetYearGc: plan.budgetYearGc,
                }}
                onSubmit={(values) => {
                  updateMeta.mutate({
                    id: plan.id,
                    farmEstateId: values.farmEstateId,
                    totalAreaHa: values.totalAreaHa ? Number(values.totalAreaHa) : null,
                    budgetYearLabel: values.budgetYearLabel,
                    budgetYearGc: values.budgetYearGc,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Step 2 — choose path */}
      <Card className="mb-6 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            2
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Activities</h2>

            {canEdit ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("form")}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5",
                    mode === "form" && "border-primary bg-primary/5 ring-1 ring-primary/30",
                  )}
                >
                  <Keyboard className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">Build in app</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("excel")}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5",
                    mode === "excel" && "border-primary bg-primary/5 ring-1 ring-primary/30",
                  )}
                >
                  <FileSpreadsheet className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">Upload Excel</p>
                </button>
              </div>
            ) : null}

            {hasActivities ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1 font-normal">
                  <CheckCircle2 className="h-3 w-3" />
                  {(parsed.sections || []).length} section(s) ·{" "}
                  {(parsed.grandTotalEtb ?? 0).toLocaleString()} ETB
                </Badge>
                <Button type="button" size="sm" variant="ghost" onClick={() => setMode("summary")}>
                  Summary
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {mode === "form" ? (
        <div className="mb-6">
          {templateLoading || !template ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">Loading…</Card>
          ) : (
            <WorkPlanBuilder
              key={`${plan.id}-${plan.updatedAt}-${plan.farmEstateId}`}
              template={template}
              parsed={parsed}
              farmBlocks={farmBlockCodes}
              readOnly={!canEdit}
              isSaving={updatePlan.isPending}
              onSave={(next) => {
                updatePlan.mutate(
                  {
                    id: plan.id,
                    parsedJson: {
                      ...next,
                      farmName: plan.farmName,
                      totalAreaHa: plan.totalAreaHa,
                      budgetYearLabel: plan.budgetYearLabel,
                      budgetYearGc: plan.budgetYearGc,
                    },
                  },
                  { onSuccess: () => setMode("summary") },
                );
              }}
            />
          )}
        </div>
      ) : null}

      {mode === "excel" ? (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-sm font-semibold">Upload Excel</h2>
          {canEdit ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="upload-section" className="mb-1.5 block text-sm font-medium">
                  Operation
                </label>
                <select
                  id="upload-section"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={uploadSectionCode}
                  onChange={(e) => {
                    setUploadSectionCode(e.target.value);
                    setUploadError(null);
                  }}
                >
                  <option value="">Select operation…</option>
                  <option value="nursery">I. Nursery Operations</option>
                  <option value="young_coffee">II. Young Coffee Care</option>
                  <option value="matured_coffee">III. Mature Coffee Main Care</option>
                  <option value="infilling">IV. Infilling Operations</option>
                  <option value="harvest">V &amp; VI. Harvest &amp; Processing</option>
                  <option value="materials">Materials</option>
                  <option value="salary">Salary &amp; Admin</option>
                </select>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onUploadFile(file);
                }}
              />
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center",
                  !uploadSectionCode && "opacity-60",
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!uploadSectionCode) {
                    setUploadError("Select which operation this Excel is for before uploading.");
                    return;
                  }
                  const file = e.dataTransfer.files?.[0];
                  if (file) onUploadFile(file);
                }}
              >
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <Button
                  variant="outline"
                  disabled={uploadPlan.isPending || !uploadSectionCode}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploadPlan.isPending ? "Uploading…" : "Choose Excel file"}
                </Button>
                {uploadFileName ? (
                  <p className="mt-2 text-xs text-muted-foreground">{uploadFileName}</p>
                ) : null}
              </div>

              {uploadError ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {uploadError}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}

      {mode === "summary" || (mode === "choose" && hasActivities) ? (
        <div className="mb-6">
          <SummaryPanels parsed={parsed} plan={plan} />
        </div>
      ) : null}

      {canEdit ? (
        <Card className="mb-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Finalize</h2>
            </div>
            {canSubmit ? (
              <Button
                variant="outline"
                disabled={submitPlan.isPending}
                onClick={() => submitPlan.mutate(plan.id)}
              >
                {submitPlan.isPending ? "Saving…" : isSpx ? "Mark as submitted" : "Submit for review"}
              </Button>
            ) : (
              <Button disabled variant="outline">
                {!plan.farmEstateId ? "Select farm estate first" : "Add activities first"}
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {plan.status === "accepted" ? (
        <Card className="mt-6 p-5">
          <Link href="/planning/afp" className="text-sm text-primary hover:underline">
            View annual plan →
          </Link>
        </Card>
      ) : null}

      <div className="mt-6">
        <EntityMessagesPanel
          entityType="work_plan_submission"
          entityId={plan.id}
          title={plan.farmName || "Work plan"}
        />
      </div>
    </PageShell>
  );
}

function SummaryPanels({
  parsed,
  plan,
}: {
  parsed: ParsedPlan;
  plan?: { farmName?: string | null; totalAreaHa?: number | null; budgetYearLabel?: string };
}) {
  const sectionRows = (parsed.sections || []).map((s) => {
    const md = s.activities.reduce((sum, a) => sum + (a.annualMandays || 0), 0);
    const cost = s.activities.reduce((sum, a) => sum + (a.annualCostEtb || 0), 0);
    const withMonths = s.activities.filter((a) =>
      (a.schedule || []).some((r) => (r.quantity || 0) > 0),
    ).length;
    return { ...s, md, cost, withMonths };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan overview</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Farm</dt>
            <dd className="font-medium">{plan?.farmName || parsed.farmName || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Budget year</dt>
            <dd className="font-medium">{plan?.budgetYearLabel || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Source</dt>
            <dd className="font-medium capitalize">{parsed.inputMethod || parsed.source || "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Total area</dt>
            <dd className="font-medium tabular-nums">
              {plan?.totalAreaHa ?? parsed.totalAreaHa ?? "—"}
              {plan?.totalAreaHa != null || parsed.totalAreaHa != null ? " ha" : ""}
            </dd>
          </div>
        </dl>
        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category summary
        </h2>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {(parsed.grandTotalEtb ?? sectionRows.reduce((s, r) => s + r.cost, 0)).toLocaleString()} ETB
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {sectionRows.length === 0 && !(parsed.categories || []).some((c) => c.budgetEtb > 0) ? (
            <li className="text-muted-foreground">—</li>
          ) : sectionRows.length > 0 ? (
            sectionRows.map((s) => (
              <li
                key={s.sectionCode || s.sectionLabel}
                className="flex justify-between gap-2 border-b pb-2 last:border-0"
              >
                <span className="min-w-0 truncate">{s.sectionLabel}</span>
                <span className="shrink-0 tabular-nums font-medium">{s.cost.toLocaleString()} ETB</span>
              </li>
            ))
          ) : (
            (parsed.categories || [])
              .filter((c) => c.budgetEtb > 0)
              .map((c) => (
                <li key={c.afpLineId} className="flex justify-between gap-2 border-b pb-2 last:border-0">
                  <span className="min-w-0 truncate">{c.activity}</span>
                  <span className="shrink-0 tabular-nums font-medium">{c.budgetEtb?.toLocaleString()} ETB</span>
                </li>
              ))
          )}
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity sections</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {sectionRows.length === 0 ? (
            <li className="text-muted-foreground">—</li>
          ) : (
            sectionRows.map((s) => (
              <li key={s.sectionCode || s.sectionLabel}>
                <p className="font-medium">{s.sectionLabel}</p>
                <p className="text-muted-foreground">
                  {s.activities.length} · {s.md.toLocaleString()} MD · {s.cost.toLocaleString()} ETB
                </p>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
