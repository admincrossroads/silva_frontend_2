"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  useWorkOrder,
  useIssueWorkOrder,
  useStartWorkOrder,
  useCompleteWorkOrder,
  useCloseWorkOrder,
} from "@/hooks/use-work-orders";
import { ifsFormApi } from "@/lib/api/field-ops";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { isVendorRole } from "@/lib/config/role-access";
import type { RoleKey } from "@/lib/utils/constants";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function WorkOrderDetailPage() {
  const { woId } = useParams<{ woId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || "") as RoleKey;
  const canQuickLog = role === "vendor_field_lead" || role === "vendor_worker";
  const { data: wo, isLoading } = useWorkOrder(woId);
  const [logTitle, setLogTitle] = useState("Daily work log");
  const [logSummary, setLogSummary] = useState("");
  const [logError, setLogError] = useState("");

  const issueMutation = useIssueWorkOrder();
  const startMutation = useStartWorkOrder();
  const completeMutation = useCompleteWorkOrder();
  const closeMutation = useCloseWorkOrder();

  const quickLog = useMutation({
    mutationFn: async () => {
      const form = await ifsFormApi.create({
        formType: "daily_work_log",
        title: logTitle,
        workOrderId: woId,
        payload: { summary: logSummary, hoursWorked: 8 },
      });
      return ifsFormApi.submit(form.id);
    },
    onSuccess: () => {
      setLogError("");
      setLogSummary("");
      router.push("/execution/forms");
    },
    onError: (err) => setLogError(getApiErrorMessage(err, "Could not submit log")),
  });

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

      {canQuickLog && wo.status !== "draft" && isVendorRole(role) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick monitoring log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Field Lead desk — submit a daily work log linked to this WO without leaving the page.
            </p>
            {logError ? <p className="text-sm text-destructive">{logError}</p> : null}
            <Input label="Title" value={logTitle} onChange={(e) => setLogTitle(e.target.value)} />
            <Textarea
              label="Summary"
              value={logSummary}
              onChange={(e) => setLogSummary(e.target.value)}
              placeholder="What happened in the field today?"
            />
            <div className="flex justify-end">
              <Button
                disabled={quickLog.isPending || !logSummary.trim()}
                onClick={() => quickLog.mutate()}
              >
                Submit daily log
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AttachmentsPanel
        entityType="work_order"
        entityId={wo.id}
        canUpload={wo.status === "draft"}
      />
    </div>
  );
}
