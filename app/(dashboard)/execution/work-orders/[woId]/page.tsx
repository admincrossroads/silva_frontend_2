"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useWorkOrder,
  useIssueWorkOrder,
  useStartWorkOrder,
  useCompleteWorkOrder,
  useCloseWorkOrder,
} from "@/hooks/use-work-orders";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function WorkOrderDetailPage() {
  const { woId } = useParams<{ woId: string }>();
  const router = useRouter();
  const { data: wo, isLoading } = useWorkOrder(woId);

  const issueMutation = useIssueWorkOrder();
  const startMutation = useStartWorkOrder();
  const completeMutation = useCompleteWorkOrder();
  const closeMutation = useCloseWorkOrder();

  if (isLoading) return <p className="text-muted-foreground p-6">Loading…</p>;
  if (!wo) return <p className="text-muted-foreground p-6">Work order not found.</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/execution/work-orders")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Work Orders
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Work Order {wo.id.slice(0, 8)}</h1>
        <StatusBadge status={wo.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["AFE", wo.afeId.slice(0, 8)],
          ["Category", wo.category],
          ["Activity", wo.activity],
          ["Tier", wo.tier],
          ["Weeks", `W${wo.weekStart}–W${wo.weekEnd}`],
          ["Vendor", wo.assignedVendorId?.slice(0, 8) ?? "—"],
          ["Created", new Date(wo.createdAt).toLocaleDateString()],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-foreground mt-1">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        {wo.status === "draft" && (
          <Button
            onClick={() => issueMutation.mutate({ id: wo.id, comment: "" })}
            disabled={issueMutation.isPending}
          >
            Issue
          </Button>
        )}
        {wo.status === "issued" && (
          <Button
            onClick={() => startMutation.mutate(wo.id)}
            disabled={startMutation.isPending}
          >
            Start
          </Button>
        )}
        {wo.status === "in_progress" && (
          <Button
            onClick={() => completeMutation.mutate(wo.id)}
            disabled={completeMutation.isPending}
          >
            Complete
          </Button>
        )}
        {wo.status === "completed" && (
          <Button
            onClick={() => closeMutation.mutate({ id: wo.id, comment: "" })}
            disabled={closeMutation.isPending}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
