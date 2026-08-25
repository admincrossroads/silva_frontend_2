"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import { useFarmEstates } from "@/hooks/use-farm-estates";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell, PageLoading } from "@/components/layout/page-shell";
import { WorkPlanBuilder } from "@/components/work-plan/work-plan-builder";
import { WorkPlanSetupForm } from "@/components/work-plan/work-plan-setup-form";
import type { ParsedWorkPlan } from "@/lib/work-plan/builder";

type ParsedCategory = {
  afpLineId: string;
  activity: string;
  budgetEtb: number;
  budgetUsd?: number;
};

type ParsedPlan = ParsedWorkPlan & {
  categories?: ParsedCategory[];
  sections?: Array<{ sectionLabel: string; activities: Array<{ id: string; nameEn: string; annualCostEtb: number }> }>;
};

export default function WorkPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [inputTab, setInputTab] = useState<"form" | "excel" | "summary">("form");
  const { isVendorAdmin, isSpx } = useRole();
  const { data: plan, isLoading } = useWorkPlan(id);
  const { data: template, isLoading: templateLoading } = useWorkPlanTemplate();
  const { data: estates = [], isLoading: estatesLoading } = useFarmEstates({ status: "active" });
  const submitPlan = useSubmitWorkPlan();
  const acceptPlan = useAcceptWorkPlan();
  const rejectPlan = useRejectWorkPlan();
  const uploadPlan = useUploadWorkPlan();
  const updatePlan = useUpdateWorkPlan();
  const updateMeta = useUpdateWorkPlanMeta();

  if (isLoading || !plan) {
    return (
      <PageShell>
        <PageLoading label="Loading work plan…" />
      </PageShell>
    );
  }

  const parsed = (plan.parsedJson || {}) as ParsedPlan;
  const canEdit = isVendorAdmin && ["draft", "revision_requested"].includes(plan.status);
  const canSubmit =
    canEdit &&
    Boolean(plan.farmEstateId) &&
    (parsed.categories?.length || parsed.sections?.length || 0) > 0;
  const canReview = isSpx && plan.status === "submitted";
  const farmBlockCodes =
    plan.farmEstate?.blocks?.map((b) => b.code) ??
    estates.find((e) => e.id === plan.farmEstateId)?.blocks.map((b) => b.code) ??
    [];

  return (
    <PageShell>
      <div className="mb-6">
        <Link href="/execution/work-plans" className="text-sm text-muted-foreground hover:text-foreground">
          ← Work plans
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {plan.farmName || "Annual work plan"}
          </h1>
          <Badge variant="outline" className="capitalize">
            {plan.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.budgetYearLabel} · {plan.vendor?.name} · FX {plan.fxEtbPerUsd} ETB/USD
          {plan.totalAreaHa != null ? ` · ${plan.totalAreaHa} ha` : null}
        </p>
        {plan.reviewNotes ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {plan.reviewNotes}
          </p>
        ) : null}
      </div>

      {canReview ? (
        <Card className="mb-6 p-5">
          <h2 className="text-sm font-semibold">SPX review</h2>
          <Textarea
            label="Review notes"
            className="mt-3"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Optional notes for vendor"
          />
          <div className="mt-4 flex gap-2">
            <Button
              disabled={acceptPlan.isPending}
              onClick={() => acceptPlan.mutate({ id: plan.id, notes: reviewNotes || undefined })}
            >
              {acceptPlan.isPending ? "Promoting…" : "Accept & promote to AFP"}
            </Button>
            <Button
              variant="destructive"
              disabled={rejectPlan.isPending}
              onClick={() => rejectPlan.mutate({ id: plan.id, notes: reviewNotes || "Rejected." })}
            >
              Reject
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="mb-6 p-5">
        <h2 className="text-sm font-semibold">Plan details</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Farm name, total area, budget year, and FX rate apply to the whole submission.
        </p>
        <div className="mt-4">
          <WorkPlanSetupForm
            estates={estates}
            estatesLoading={estatesLoading}
            template={template}
            readOnly={!canEdit}
            isPending={updateMeta.isPending}
            initial={{
              farmEstateId: plan.farmEstateId ?? undefined,
              farmName: plan.farmName ?? plan.farmEstate?.name ?? undefined,
              totalAreaHa: plan.totalAreaHa ?? undefined,
              budgetYearLabel: plan.budgetYearLabel,
              budgetYearGc: plan.budgetYearGc,
              fxEtbPerUsd: String(plan.fxEtbPerUsd),
            }}
            onSubmit={(values) => {
              updateMeta.mutate({
                id: plan.id,
                farmEstateId: values.farmEstateId,
                totalAreaHa: values.totalAreaHa ? Number(values.totalAreaHa) : null,
                budgetYearLabel: values.budgetYearLabel,
                budgetYearGc: values.budgetYearGc,
                fxEtbPerUsd: Number(values.fxEtbPerUsd) || 130,
              });
            }}
          />
        </div>
      </Card>

      <Tabs
        value={inputTab}
        onValueChange={(v) => setInputTab(v as "form" | "excel" | "summary")}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="form">Build in app</TabsTrigger>
          <TabsTrigger value="excel">Upload Excel</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          {inputTab === "form" && (templateLoading || !template ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">Loading activity catalog…</Card>
          ) : template ? (
            <WorkPlanBuilder
              key={`${plan.id}-${plan.updatedAt}-${plan.farmEstateId}`}
              template={template}
              parsed={parsed}
              fx={Number(plan.fxEtbPerUsd)}
              farmBlocks={farmBlockCodes}
              readOnly={!canEdit}
              isSaving={updatePlan.isPending}
              onSave={(next) => {
                updatePlan.mutate({
                  id: plan.id,
                  parsedJson: {
                    ...next,
                    farmName: plan.farmName,
                    totalAreaHa: plan.totalAreaHa,
                    budgetYearLabel: plan.budgetYearLabel,
                    budgetYearGc: plan.budgetYearGc,
                    fxEtbPerUsd: Number(plan.fxEtbPerUsd),
                  },
                });
              }}
            />
          ) : null)}
        </TabsContent>

        <TabsContent value="excel">
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Upload Excel work plan</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the B-Agro Chetu Farm workbook: Summary, Monthly, Nursery, Young Coffee, Mature Coffee,
              Infilling, Harvest, Materials, Salary.
            </p>
            {canEdit ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadPlan.mutate(
                      { id: plan.id, file },
                      {
                        onSuccess: () => setInputTab("summary"),
                      },
                    );
                  }}
                />
                <Button variant="outline" disabled={uploadPlan.isPending} onClick={() => fileRef.current?.click()}>
                  {uploadPlan.isPending ? "Uploading…" : "Choose Excel file"}
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Plan was submitted via {parsed.inputMethod === "excel" ? "Excel upload" : "form builder"}.
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <SummaryPanels parsed={parsed} plan={plan} />
        </TabsContent>
      </Tabs>

      {canEdit ? (
        <Card className="mb-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Submit to SPX</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Save your plan draft, review the summary, then submit for SPX acceptance.
              </p>
            </div>
            {canSubmit ? (
              <Button disabled={submitPlan.isPending} onClick={() => submitPlan.mutate(plan.id)}>
                {submitPlan.isPending ? "Submitting…" : "Submit to SPX"}
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
          <p className="text-sm text-foreground">
            Promoted to AFP budget register.{" "}
            <Link href="/planning/afp" className="text-primary hover:underline">
              View budget lines →
            </Link>
          </p>
        </Card>
      ) : null}

      {isSpx && plan.status === "submitted" ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Review category totals and activity sections above before accepting.
        </p>
      ) : null}
    </PageShell>
  );
}

function SummaryPanels({ parsed, plan }: { parsed: ParsedPlan; plan?: { farmName?: string | null; totalAreaHa?: number | null; budgetYearLabel?: string } }) {
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
            <dt className="text-muted-foreground">Total area</dt>
            <dd className="font-medium tabular-nums">
              {plan?.totalAreaHa ?? parsed.totalAreaHa ?? "—"}
              {plan?.totalAreaHa != null || parsed.totalAreaHa != null ? " ha" : ""}
            </dd>
          </div>
        </dl>
        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category summary</h2>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {(parsed.grandTotalEtb ?? 0).toLocaleString()} ETB
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {(parsed.categories || []).filter((c) => c.budgetEtb > 0).length === 0 ? (
            <li className="text-muted-foreground">No categories yet — build in app or upload Excel.</li>
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
          {(parsed.sections || []).length === 0 ? (
            <li className="text-muted-foreground">No activity sections saved yet.</li>
          ) : (
            (parsed.sections || []).map((s) => (
              <li key={s.sectionLabel}>
                <p className="font-medium">{s.sectionLabel}</p>
                <p className="text-muted-foreground">{s.activities.length} activities</p>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
