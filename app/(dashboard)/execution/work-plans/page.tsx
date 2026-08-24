"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWorkPlans, useCreateWorkPlan, useWorkPlanTemplate } from "@/hooks/use-work-plans";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import { useRole } from "@/hooks/use-role";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PageShell } from "@/components/layout/page-shell";
import { FarmAreaScopeBanner } from "@/components/layout/farm-area-scope-banner";
import {
  WorkPlanSetupForm,
  type WorkPlanSetupValues,
} from "@/components/work-plan/work-plan-setup-form";

export default function WorkPlansPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { isVendorAdmin, isSpx } = useRole();
  const { data: plans = [], isLoading } = useWorkPlans();
  const { data: template } = useWorkPlanTemplate();
  const { data: estates = [], isLoading: estatesLoading } = useFarmEstates({ status: "active" });
  const createPlan = useCreateWorkPlan();

  const handleCreate = async (values: WorkPlanSetupValues) => {
    setError(null);
    try {
      const row = await createPlan.mutateAsync({
        farmEstateId: values.farmEstateId,
        totalAreaHa: values.totalAreaHa ? Number(values.totalAreaHa) : undefined,
        budgetYearLabel: values.budgetYearLabel,
        budgetYearGc: values.budgetYearGc,
        fxEtbPerUsd: Number(values.fxEtbPerUsd) || 130,
      });
      setModalOpen(false);
      router.push(`/execution/work-plans/${row.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create work plan. Select a program in Settings if needed."));
    }
  };

  return (
    <PageShell>
      <FarmAreaScopeBanner />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Annual work plan</h1>
          
        </div>
        {isVendorAdmin ? (
          <Button disabled={createPlan.isPending} onClick={() => setModalOpen(true)}>
            New work plan
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Farm</th>
              <th className="px-4 py-2 font-medium">Budget year</th>
              <th className="px-4 py-2 font-medium">Vendor</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No work plan submissions yet.
                  {isVendorAdmin ? " Click New work plan to start." : null}
                </td>
              </tr>
            ) : (
              plans.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{p.farmName || "—"}</td>
                  <td className="px-4 py-3">{p.budgetYearLabel}</td>
                  <td className="px-4 py-3">{p.vendor?.name ?? p.vendorId}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/execution/work-plans/${p.id}`} className="text-primary hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {isSpx ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Submitted plans appear in your dashboard action queue for review and promotion.
        </p>
      ) : null}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New annual work plan"
        description="Select the farm and budget year before building activities or uploading Excel."
      >
        <WorkPlanSetupForm
          estates={estates}
          estatesLoading={estatesLoading}
          template={template}
          submitLabel={createPlan.isPending ? "Creating…" : "Create work plan"}
          isPending={createPlan.isPending}
          onSubmit={handleCreate}
        />
      </Modal>
    </PageShell>
  );
}
