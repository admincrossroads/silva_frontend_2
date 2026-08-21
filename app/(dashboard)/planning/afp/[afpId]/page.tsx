"use client";

import { useParams } from "next/navigation";
import { useAfp, useSubmitAfp, useApproveAfp } from "@/hooks/use-afps";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";

const STATUS_STEPS = ["draft", "submitted", "approved", "closed"];

export default function AfpDetailPage() {
  const { afpId } = useParams<{ afpId: string }>();
  const { data: afp, isLoading } = useAfp(afpId);
  const submitAfp = useSubmitAfp();
  const approveAfp = useApproveAfp();

  if (isLoading || !afp) {
    return <div className="p-6">Loading...</div>;
  }

  const currentStep = STATUS_STEPS.indexOf(afp.status);

  function formatUsd(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AFP Detail</h1>
        <StatusBadge status={afp.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">{afp.year}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Discipline</p>
              <p className="font-medium">{afp.operatingDiscipline}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Activity</p>
              <p className="font-medium">{afp.activity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">{formatUsd(afp.budgetAllocatedUsd)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KPI Target</p>
              <p className="font-medium">{afp.kpiTarget}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{afp.notes || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {STATUS_STEPS.map((step, idx) => (
                <li key={step} className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      idx <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span
                    className={
                      idx <= currentStep
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-6 space-y-2">
              {afp.status === "draft" && (
                <Button
                  className="w-full"
                  onClick={() => submitAfp.mutate({ id: afp.id, comment: "" })}
                  disabled={submitAfp.isPending}
                >
                  Submit for Approval
                </Button>
              )}
              {afp.status === "submitted" && (
                <Button
                  className="w-full"
                  onClick={() => approveAfp.mutate({ id: afp.id, comment: "" })}
                  disabled={approveAfp.isPending}
                >
                  Approve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AttachmentsPanel
        entityType="afp_line"
        entityId={afp.id}
        canUpload={afp.status === "draft"}
      />
    </div>
  );
}
