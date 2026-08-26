"use client";

import { useParams } from "next/navigation";
import { useSettlement, useAuthorizeSettlement, useMarkSettled } from "@/hooks/use-settlements";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { ActivityFeed, InfoRow, StatusTimeline } from "@/components/items/activity-feed";
import { DetailPageHeader, PageLoading, PageShell } from "@/components/layout/page-shell";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { EntityMessagesPanel } from "@/components/messages/entity-messages-panel";
import { formatOptionalNumber } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { SETTLEMENT_COLUMNS } from "@/lib/items/board-adapters";
import { Banknote, Calendar, FileText, Layers, User, Wrench } from "lucide-react";

export default function SettlementDetailPage() {
  const { stlId } = useParams<{ stlId: string }>();
  const { has } = usePermissions();
  const { data: stl, isLoading } = useSettlement(stlId);
  const authorize = useAuthorizeSettlement();
  const markSettled = useMarkSettled();

  const canAuthorize = has("settlements.authorize");
  const canMarkSettled = has("settlements.mark_settled");

  if (isLoading || !stl) {
    return (
      <PageShell>
        <PageLoading label="Loading settlement…" />
      </PageShell>
    );
  }

  const isTerminal = stl.status === "settled";
  const amountLabel = `${formatOptionalNumber(stl.amountEtb)} ETB`;

  return (
    <PageShell>
      <DetailPageHeader
        title={stl.payee}
        backHref="/payments/settlements"
        backLabel="Settlements"
        badges={
          <>
            <Badge variant="secondary" className="font-mono text-[10px] font-normal">{stl.id}</Badge>
            <StatusBadge status={stl.status} />
          </>
        }
        actions={<StartMessageButton entityType="owner_settlement" entityId={stl.id} label={stl.payee} />}
      />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Owner settlement</p>
            <p className="mt-1 font-display text-2xl font-semibold">{amountLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stl.type.replace(/_/g, " ")} · {stl.paymentRequestId}
            </p>
          </div>
          <Badge variant="outline" className="gap-1 py-1">
            <Banknote className="h-3 w-3" />
            Settlement
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
              <InfoRow icon={User} label="Payee" value={stl.payee} className="sm:col-span-2" />
              <InfoRow icon={Wrench} label="Work order" value={stl.workOrderId} />
              <InfoRow icon={FileText} label="Payment request" value={stl.paymentRequestId} />
              <InfoRow icon={Layers} label="Type" value={stl.type.replace(/_/g, " ")} />
              <InfoRow icon={Banknote} label="Amount" value={amountLabel} />
              <InfoRow icon={Calendar} label="Created" value={new Date(stl.createdAt).toLocaleDateString()} />
            </dl>
          </Card>

          <ActivityFeed entityType="owner_settlement" entityId={stl.id} />
          <EntityMessagesPanel entityType="owner_settlement" entityId={stl.id} title={stl.payee} />
          <AttachmentsPanel
            entityType="owner_settlement"
            entityId={stl.id}
            canUpload={stl.status === "draft" && canAuthorize}
          />
        </div>

        <Card className="p-5 lg:sticky lg:top-20 lg:self-start">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status timeline</h3>
          <StatusTimeline steps={SETTLEMENT_COLUMNS} current={stl.status} />

          {!isTerminal ? (
            <div className="mt-6 space-y-2 border-t pt-4">
              {stl.status === "draft" && canAuthorize ? (
                <Button
                  className="w-full"
                  onClick={() => authorize.mutate(stl.id)}
                  disabled={authorize.isPending}
                >
                  Authorize settlement
                </Button>
              ) : null}
              {stl.status === "draft" && !canAuthorize ? (
                <p className="text-center text-sm text-muted-foreground">
                  Waiting for SPX to authorize this settlement.
                </p>
              ) : null}
              {stl.status === "authorized" && canMarkSettled ? (
                <Button
                  className="w-full"
                  onClick={() => markSettled.mutate(stl.id)}
                  disabled={markSettled.isPending}
                >
                  Mark as settled
                </Button>
              ) : null}
              {stl.status === "authorized" && !canMarkSettled ? (
                <p className="text-center text-sm text-muted-foreground">
                  Waiting for Silva owner or finance to mark this settlement as paid.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 border-t pt-4 text-center text-sm text-muted-foreground">
              This settlement has been completed.
            </p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
