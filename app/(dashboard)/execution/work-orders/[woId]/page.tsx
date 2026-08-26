"use client";

import { useParams } from "next/navigation";
import {
  useWorkOrder,
  useIssueWorkOrder,
  useStartWorkOrder,
  useCompleteWorkOrder,
  useCloseWorkOrder,
} from "@/hooks/use-work-orders";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { ActivityFeed, InfoRow, StatusTimeline } from "@/components/items/activity-feed";
import { DetailPageHeader, PageLoading, PageShell } from "@/components/layout/page-shell";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { EntityMessagesPanel } from "@/components/messages/entity-messages-panel";
import { WO_WORKFLOW } from "@/lib/config/procore-modules";
import { useRole } from "@/hooks/use-role";
import { CalendarDays, FileText, Layers, User, Wrench } from "lucide-react";

export default function WorkOrderDetailPage() {
  const { woId } = useParams<{ woId: string }>();
  const { isSpx, isSystemAdmin } = useRole();
  const canManageWo = isSpx || isSystemAdmin;
  const { data: wo, isLoading } = useWorkOrder(woId);

  const issueMutation = useIssueWorkOrder();
  const startMutation = useStartWorkOrder();
  const completeMutation = useCompleteWorkOrder();
  const closeMutation = useCloseWorkOrder();

  if (isLoading || !wo) {
    return (
      <PageShell>
        <PageLoading label="Loading work order…" />
      </PageShell>
    );
  }

  const isTerminal = wo.status === "closed";

  return (
    <PageShell>
      <DetailPageHeader
        title={wo.activity}
        backHref="/execution/work-orders"
        backLabel="Work orders"
        badges={
          <>
            <Badge variant="secondary" className="font-mono text-[10px] font-normal">{wo.id}</Badge>
            <StatusBadge status={wo.status} />
          </>
        }
        actions={<StartMessageButton entityType="work_order" entityId={wo.id} label={wo.activity} />}
      />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Schedule window</p>
            <p className="mt-1 font-display text-2xl font-semibold">Weeks {wo.weekStart}–{wo.weekEnd}</p>
            <p className="mt-1 text-sm text-muted-foreground">{wo.category} · Tier {wo.tier}</p>
          </div>
          <Badge variant="outline" className="gap-1 py-1">
            <CalendarDays className="h-3 w-3" />
            Schedule
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
              <InfoRow icon={Wrench} label="Activity" value={wo.activity} className="sm:col-span-2" />
              <InfoRow icon={Layers} label="Category" value={wo.category} />
              <InfoRow icon={CalendarDays} label="Weeks" value={`W${wo.weekStart}–W${wo.weekEnd}`} />
              <InfoRow icon={FileText} label="AFE" value={wo.afeId} />
              <InfoRow icon={User} label="Vendor" value={wo.assignedVendorId ?? "Unassigned"} />
            </dl>
          </Card>

          <ActivityFeed entityType="work_order" entityId={wo.id} />
          <EntityMessagesPanel entityType="work_order" entityId={wo.id} title={wo.activity} />
          <AttachmentsPanel
            entityType="work_order"
            entityId={wo.id}
            canUpload={canManageWo && wo.status === "draft"}
          />
        </div>

        <Card className="p-5 lg:sticky lg:top-20 lg:self-start">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status timeline</h3>
          <StatusTimeline steps={WO_WORKFLOW} current={wo.status} />

          {!isTerminal ? (
            <div className="mt-6 space-y-2 border-t pt-4">
              {canManageWo && wo.status === "draft" ? (
                <Button className="w-full" onClick={() => issueMutation.mutate({ id: wo.id, comment: "" })} disabled={issueMutation.isPending}>
                  Issue
                </Button>
              ) : null}
              {wo.status === "issued" ? (
                <Button className="w-full" onClick={() => startMutation.mutate(wo.id)} disabled={startMutation.isPending}>
                  Start
                </Button>
              ) : null}
              {wo.status === "in_progress" ? (
                <Button className="w-full" onClick={() => completeMutation.mutate(wo.id)} disabled={completeMutation.isPending}>
                  Complete
                </Button>
              ) : null}
              {canManageWo && wo.status === "complete" ? (
                <Button className="w-full" onClick={() => closeMutation.mutate({ id: wo.id, comment: "" })} disabled={closeMutation.isPending}>
                  Close
                </Button>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </PageShell>
  );
}
