"use client";

import { useParams } from "next/navigation";
import {
  useFieldTicket,
  useSubmitFieldTicket,
  useVendorReviewFieldTicket,
  useValidateFieldTicket,
  useRejectFieldTicket,
} from "@/hooks/use-field-tickets";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { ActivityFeed, InfoRow, StatusTimeline } from "@/components/items/activity-feed";
import { DetailPageHeader, PageLoading, PageShell } from "@/components/layout/page-shell";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { EntityMessagesPanel } from "@/components/messages/entity-messages-panel";
import { Calendar, ClipboardList, FileText, MapPin, Users, Wrench } from "lucide-react";

const FT_STEPS = ["draft", "submitted", "vendor_reviewed", "validated"] as const;

export default function FieldTicketDetailPage() {
  const { ftId } = useParams<{ ftId: string }>();
  const { user } = useAuth();
  const { has } = usePermissions();
  const { data: ft, isLoading } = useFieldTicket(ftId);

  const submitMutation = useSubmitFieldTicket();
  const reviewMutation = useVendorReviewFieldTicket();
  const validateMutation = useValidateFieldTicket();
  const rejectMutation = useRejectFieldTicket();

  if (isLoading || !ft) {
    return (
      <PageShell>
        <PageLoading label="Loading field ticket…" />
      </PageShell>
    );
  }

  const isSubmitter = ft.submittedByUserId === user?.id;
  const isRejected = ft.status === "rejected";
  const isTerminal = isRejected || ft.status === "validated";
  const canSubmit = ft.status === "draft" && has("field_tickets.create");
  const canReview = ft.status === "submitted" && has("field_tickets.review") && !isSubmitter;
  const canValidate = ft.status === "vendor_reviewed" && has("field_tickets.validate") && !isSubmitter;
  const canReject = canReview || canValidate;

  return (
    <PageShell>
      <DetailPageHeader
        title={ft.activityRecorded}
        backHref="/execution/field-tickets"
        backLabel="Field tickets"
        badges={
          <>
            <Badge variant="secondary" className="font-mono text-[10px] font-normal">{ft.id}</Badge>
            <StatusBadge status={ft.status} />
          </>
        }
        actions={<StartMessageButton entityType="field_ticket" entityId={ft.id} label={ft.activityRecorded} />}
      />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Field execution</p>
            <p className="mt-1 font-display text-2xl font-semibold">{ft.areaHa?.toFixed(2) ?? "—"} ha</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(ft.ticketDate).toLocaleDateString()} · {ft.laborCount ?? "—"} labor
            </p>
          </div>
          <Badge variant="outline" className="gap-1 py-1">
            <ClipboardList className="h-3 w-3" />
            Daily log
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
              <InfoRow icon={Wrench} label="Work order" value={ft.workOrderId} className="sm:col-span-2" />
              <InfoRow icon={ClipboardList} label="Activity" value={ft.activityRecorded} className="sm:col-span-2" />
              <InfoRow icon={MapPin} label="Area" value={`${ft.areaHa?.toFixed(2) ?? "—"} ha`} />
              <InfoRow icon={Users} label="Labor count" value={String(ft.laborCount ?? "—")} />
              <InfoRow icon={Calendar} label="Ticket date" value={new Date(ft.ticketDate).toLocaleDateString()} />
              <InfoRow icon={Calendar} label="Created" value={new Date(ft.createdAt).toLocaleDateString()} />
            </dl>
          </Card>

          {ft.normValidation?.flags?.length ? (
            <Card className="border-amber-200 bg-amber-50/50 p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-900">Norm validation</h3>
              <ul className="space-y-1 text-sm text-amber-900">
                {ft.normValidation.flags.map((f) => (
                  <li key={f.code}>{f.message}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          <ActivityFeed entityType="field_ticket" entityId={ft.id} />
          <EntityMessagesPanel entityType="field_ticket" entityId={ft.id} title={ft.activityRecorded} />
          <AttachmentsPanel entityType="field_ticket" entityId={ft.id} canUpload={ft.status === "draft"} />
        </div>

        <Card className="p-5 lg:sticky lg:top-20 lg:self-start">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status timeline</h3>
          {isRejected ? (
            <p className="text-sm font-medium text-destructive">Rejected</p>
          ) : (
            <StatusTimeline steps={FT_STEPS} current={ft.status} />
          )}

          {!isTerminal ? (
            <div className="mt-6 space-y-2 border-t pt-4">
              {canSubmit ? (
                <Button className="w-full" onClick={() => submitMutation.mutate(ft.id)} disabled={submitMutation.isPending}>
                  Submit
                </Button>
              ) : null}
              {canReview ? (
                <Button className="w-full" onClick={() => reviewMutation.mutate(ft.id)} disabled={reviewMutation.isPending}>
                  Vendor review
                </Button>
              ) : null}
              {canValidate ? (
                <Button className="w-full" onClick={() => validateMutation.mutate({ id: ft.id, comment: "" })} disabled={validateMutation.isPending}>
                  SPX validate
                </Button>
              ) : null}
              {canReject ? (
                <Button variant="destructive" className="w-full" onClick={() => rejectMutation.mutate({ id: ft.id, reason: "Rejected from UI" })} disabled={rejectMutation.isPending}>
                  Reject
                </Button>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </PageShell>
  );
}
