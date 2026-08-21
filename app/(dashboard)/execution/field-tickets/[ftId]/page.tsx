"use client";

import { useParams, useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function FieldTicketDetailPage() {
  const { ftId } = useParams<{ ftId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { has } = usePermissions();
  const { data: ft, isLoading } = useFieldTicket(ftId);

  const submitMutation = useSubmitFieldTicket();
  const reviewMutation = useVendorReviewFieldTicket();
  const validateMutation = useValidateFieldTicket();
  const rejectMutation = useRejectFieldTicket();

  if (isLoading) return <p className="text-muted-foreground p-6">Loading…</p>;
  if (!ft) return <p className="text-muted-foreground p-6">Field ticket not found.</p>;

  const isSubmitter = ft.submittedByUserId === user?.id;
  const canSubmit = ft.status === "draft" && has("field_tickets.create");
  const canReview = ft.status === "submitted" && has("field_tickets.review") && !isSubmitter;
  const canValidate =
    ft.status === "vendor_reviewed" &&
    has("field_tickets.validate") &&
    !isSubmitter;
  const canReject = canReview || canValidate;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/execution/field-tickets")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Field Tickets
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{ft.id}</h1>
        <StatusBadge status={ft.status} />
      </div>

      <Card className="p-4 bg-muted/40">
        <p className="text-xs text-muted-foreground">
          Workflow: Draft → Submit → Vendor supervisor review → SPX Field Agronomist validate (sign-off) → Payment
          Request unlocked. Maker-checker applies: submitter cannot review or validate their own ticket.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["Work Order", ft.workOrderId],
          ["Activity", ft.activityRecorded],
          ["Area (ha)", ft.areaHa?.toFixed(2) ?? "—"],
          ["Labor Count", String(ft.laborCount ?? "—")],
          ["Ticket Date", new Date(ft.ticketDate).toLocaleDateString()],
          ["Created", new Date(ft.createdAt).toLocaleDateString()],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {canSubmit ? (
          <Button onClick={() => submitMutation.mutate(ft.id)} disabled={submitMutation.isPending}>
            Submit
          </Button>
        ) : null}
        {canReview ? (
          <Button onClick={() => reviewMutation.mutate(ft.id)} disabled={reviewMutation.isPending}>
            Vendor review
          </Button>
        ) : null}
        {canValidate ? (
          <Button
            onClick={() => validateMutation.mutate({ id: ft.id, comment: "" })}
            disabled={validateMutation.isPending}
          >
            SPX validate
          </Button>
        ) : null}
        {canReject ? (
          <Button
            variant="destructive"
            onClick={() => rejectMutation.mutate({ id: ft.id, reason: "Rejected from UI" })}
            disabled={rejectMutation.isPending}
          >
            Reject
          </Button>
        ) : null}
      </div>
    </div>
  );
}
