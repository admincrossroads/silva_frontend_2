"use client";

import { useParams } from "next/navigation";
import {
  useAfe,
  useSubmitAfe,
  useValidateAfe,
  useApproveAfe,
  useRejectAfe,
} from "@/hooks/use-afes";
import { StatusBadge } from "@/components/badges/status-badge";
import { BandBadge } from "@/components/badges/band-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { cn } from "@/lib/utils";
import { Check, Circle, AlertCircle } from "lucide-react";

const STATUS_STEPS = ["draft", "submitted", "validated", "approved", "closed"];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
}

export default function AfeDetailPage() {
  const { afeId } = useParams<{ afeId: string }>();
  const { data: afe, isLoading } = useAfe(afeId);
  const submitAfe = useSubmitAfe();
  const validateAfe = useValidateAfe();
  const approveAfe = useApproveAfe();
  const rejectAfe = useRejectAfe();

  if (isLoading || !afe) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(afe.status);
  const isRejected = afe.status === "rejected";
  const isTerminal = isRejected || afe.status === "closed";

  const fields = [
    { label: "ID", value: afe.id },
    { label: "Operating Discipline", value: afe.operatingDiscipline },
    { label: "Description", value: afe.description },
    { label: "Estimated Cost", value: formatUsd(afe.estimatedCostUsd) },
    { label: "Band", value: <BandBadge band={afe.band} /> },
    { label: "Silva Approval", value: afe.silvaApprovalRequired ? "Required" : "Not required" },
    { label: "AFP Line", value: afe.afpLineId },
    { label: "Created", value: new Date(afe.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="page-title">{afe.id}</h1>
        <BandBadge band={afe.band} />
        <StatusBadge status={afe.status} />
      </div>

      <Card className="p-4 border-primary/20 bg-primary/5">
        <p className="text-sm font-medium text-foreground">Schedule 3 — Band {afe.band}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {afe.band === "A" && "SPX may decide and issue directly within the approved AFP. Silva is informed in the monthly report."}
          {afe.band === "B" &&
            "SPX may issue and must notify Silva within 5 business days. Silva may object within that window; silence is deemed approval."}
          {afe.band === "C" &&
            "SPX recommends only. Silva written approval is required before the AFE issues — do not commit resources until approved."}
          {afe.band === "D" &&
            "Special Situation / major capital. Silva approval required, with competitive tender evidence where applicable."}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Progress</h3>
          <ol className="space-y-3">
            {STATUS_STEPS.map((step, idx) => {
              const completed = idx < currentStep;
              const current = idx === currentStep && !isRejected;
              return (
                <li key={step} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      completed && "bg-primary border-primary",
                      current && "border-primary bg-primary/10",
                      !completed && !current && "border-border bg-background"
                    )}
                  >
                    {completed && <Check className="h-3 w-3 text-primary-foreground" />}
                    {current && <Circle className="h-2 w-2 fill-primary text-primary" />}
                  </div>
                  <span className={cn("text-sm", completed || current ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                </li>
              );
            })}
            {isRejected && (
              <li className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive border-destructive">
                  <AlertCircle className="h-3 w-3 text-destructive-foreground" />
                </div>
                <span className="text-sm font-medium text-destructive">Rejected</span>
              </li>
            )}
          </ol>
        </Card>
      </div>

      {!isTerminal && (
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-end gap-2">
          {afe.status === "draft" && (
            <Button
              size="sm"
              className="text-xs"
              onClick={() => submitAfe.mutate({ id: afe.id, comment: "" })}
              disabled={submitAfe.isPending}
            >
              Submit for Review
            </Button>
          )}
          {afe.status === "submitted" && (
            <Button
              size="sm"
              className="text-xs"
              onClick={() => validateAfe.mutate({ id: afe.id, comment: "" })}
              disabled={validateAfe.isPending}
            >
              Validate
            </Button>
          )}
          {afe.status === "validated" && (
            <Button
              size="sm"
              className="text-xs"
              onClick={() => approveAfe.mutate({ id: afe.id, comment: "" })}
              disabled={approveAfe.isPending}
            >
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => rejectAfe.mutate({ id: afe.id, reason: "" })}
            disabled={rejectAfe.isPending}
          >
            Reject
          </Button>
        </div>
      )}

      <AttachmentsPanel entityType="afe" entityId={afe.id} canUpload={afe.status === "draft"} />
    </div>
  );
}
