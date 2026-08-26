"use client";

import { useParams, useRouter } from "next/navigation";
import {
  usePaymentRequest,
  useSubmitPaymentRequest,
  useVerifyPaymentRequest,
  useRejectPaymentRequest,
} from "@/hooks/use-payment-requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { EntityMessagesPanel } from "@/components/messages/entity-messages-panel";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowLeft } from "lucide-react";

export default function PaymentRequestDetailPage() {
  const { prId } = useParams<{ prId: string }>();
  const router = useRouter();
  const { data: pr, isLoading } = usePaymentRequest(prId);
  const submit = useSubmitPaymentRequest();
  const verify = useVerifyPaymentRequest();
  const reject = useRejectPaymentRequest();

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  if (!pr) return <div className="py-12 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Request</h1>
          <p className="font-mono text-sm text-muted-foreground">{pr.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <StartMessageButton entityType="payment_request" entityId={pr.id} label={pr.id} />
          <StatusBadge status={pr.status} />
        </div>
      </div>

      <Card className="p-4 bg-muted/40">
        <p className="text-xs text-muted-foreground">
          Created only after a validated Field Ticket. SPX verifies against the Work Order, then Owner Settlement pays
          the vendor directly. Settlement status appears here once authorized.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Work Order" value={pr.workOrderId} />
            <Row label="Field Ticket" value={pr.fieldTicketId} />
            <Row label="Type" value={pr.type.replace(/_/g, " ")} />
            <Row label="Amount (ETB)" value={formatCurrency(pr.amountRequestedEtb, "ETB")} />
            <Row label="Created" value={formatDate(pr.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pr.status === "draft" && (
              <Button className="w-full" onClick={() => submit.mutate(prId)} disabled={submit.isPending}>
                Submit for Review
              </Button>
            )}
            {pr.status === "submitted" && (
              <>
                <Button className="w-full" onClick={() => verify.mutate(prId)} disabled={verify.isPending}>
                  Verify
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => reject.mutate({ id: prId, reason: "Rejected" })}
                  disabled={reject.isPending}
                >
                  Reject
                </Button>
              </>
            )}
            {pr.status === "verified" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/payments/settlements")}
              >
                Create Settlement
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <AttachmentsPanel
        entityType="payment_request"
        entityId={pr.id}
        canUpload={pr.status === "draft"}
      />
      <EntityMessagesPanel entityType="payment_request" entityId={pr.id} title={pr.id} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
