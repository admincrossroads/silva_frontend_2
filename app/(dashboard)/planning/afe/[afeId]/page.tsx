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
import { Badge } from "@/components/ui/badge";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { ActivityFeed, InfoRow, StatusTimeline } from "@/components/items/activity-feed";
import { DetailPageHeader, PageLoading, PageShell } from "@/components/layout/page-shell";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  FileCheck,
  FileText,
  Layers,
  Shield,
} from "lucide-react";

const STATUS_STEPS = ["draft", "submitted", "validated", "approved", "closed"] as const;

function formatUsd(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(
    Number(value),
  );
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
      <PageShell>
        <PageLoading label="Loading commitment…" />
      </PageShell>
    );
  }

  const isRejected = afe.status === "rejected";
  const isTerminal = isRejected || afe.status === "closed";

  return (
    <PageShell>
      <DetailPageHeader
        title={afe.description}
        backHref="/planning/afe"
        backLabel="AFE register"
        badges={
          <>
            <Badge variant="outline" className="font-mono text-[10px] font-normal">{afe.id}</Badge>
            <BandBadge band={afe.band} />
            <StatusBadge status={afe.status} />
            {afe.planningMode === "ad_hoc" ? <Badge variant="secondary">Ad-hoc</Badge> : null}
          </>
        }
      />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Estimated cost</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{formatUsd(afe.estimatedCostUsd)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{afe.operatingDiscipline} · Band {afe.band}</p>
          </div>
          <Badge variant="outline" className="gap-1 py-1">
            <Shield className="h-3 w-3" />
            Schedule 3
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Information
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={Layers} label="Discipline" value={afe.operatingDiscipline} />
              <InfoRow icon={FileCheck} label="Band" value={`Band ${afe.band}`} />
              <InfoRow
                icon={FileText}
                label="Planning"
                value={afe.planningMode === "ad_hoc" ? "Ad-hoc (outside annual plan)" : "Planned"}
              />
              <InfoRow icon={FileText} label="Description" value={afe.description} className="sm:col-span-2" />
              <InfoRow icon={DollarSign} label="Estimated cost" value={formatUsd(afe.estimatedCostUsd)} />
              <InfoRow icon={Shield} label="Silva approval" value={afe.silvaApprovalRequired ? "Required" : "Not required"} />
              <InfoRow icon={Calendar} label="AFP line" value={afe.afpLineId || "— (standalone)"} className="sm:col-span-2" />
            </dl>
          </Card>

          <ActivityFeed entityType="afe" entityId={afe.id} />
        </div>

        <Card className="p-5 lg:sticky lg:top-20 lg:self-start">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status timeline</h3>
          {isRejected ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Rejected
            </div>
          ) : (
            <StatusTimeline steps={STATUS_STEPS} current={afe.status} />
          )}

          {!isTerminal ? (
            <div className="mt-6 space-y-2 border-t pt-4">
              {afe.status === "draft" ? (
                <Button className="w-full" onClick={() => submitAfe.mutate({ id: afe.id, comment: "" })} disabled={submitAfe.isPending}>
                  Submit for review
                </Button>
              ) : null}
              {afe.status === "submitted" ? (
                <Button className="w-full" onClick={() => validateAfe.mutate({ id: afe.id, comment: "" })} disabled={validateAfe.isPending}>
                  Validate
                </Button>
              ) : null}
              {afe.status === "validated" ? (
                <Button className="w-full" onClick={() => approveAfe.mutate({ id: afe.id, comment: "" })} disabled={approveAfe.isPending}>
                  Approve
                </Button>
              ) : null}
              <Button variant="destructive" className="w-full" onClick={() => rejectAfe.mutate({ id: afe.id, reason: "" })} disabled={rejectAfe.isPending}>
                Reject
              </Button>
            </div>
          ) : null}
        </Card>
      </div>

      <AttachmentsPanel entityType="afe" entityId={afe.id} canUpload={afe.status === "draft"} />
    </PageShell>
  );
}
