"use client";

import { useMemo, useState } from "react";
import { CloudOff, Plus, RefreshCw, Send } from "lucide-react";
import {
  useBlockFieldTickets,
  useCreateBlockFieldTicket,
  useSubmitBlockFieldTicket,
} from "@/hooks/use-block-field-tickets";
import { useSubmitWeeklySubmission } from "@/hooks/use-weekly-submissions";
import { useActivityMaster } from "@/hooks/use-activity-master";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import { useCropfortOfflineSync } from "@/hooks/use-cropfort-offline-sync";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateBlockFieldTicketDto } from "@/lib/api/cropfort/block-field-tickets";
import { enqueueTicket, newClientLocalId } from "@/lib/offline/cropfort-queue";
import { toast } from "@/lib/toast";

const DEMO_WEEK = "2026-08-30";

const emptyForm: CreateBlockFieldTicketDto = {
  blockId: "",
  activityId: "",
  weekEnding: DEMO_WEEK,
  actualQty: 0,
  laborHoursActual: 0,
};

export default function WeeklyEntryPage() {
  const { isVendor, isSpx, isSystemAdmin } = useRole();
  const canEdit = isVendor || isSpx || isSystemAdmin;
  const [weekEnding, setWeekEnding] = useState(DEMO_WEEK);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateBlockFieldTicketDto>(emptyForm);

  const { data: estates = [] } = useFarmEstates();
  const blocks = useMemo(
    () => estates.flatMap((e) => e.blocks.map((b) => ({ ...b, estateName: e.name }))),
    [estates],
  );
  const { data: activities = [] } = useActivityMaster();
  const { data: tickets = [], isLoading } = useBlockFieldTickets({ weekEnding });
  const createTicket = useCreateBlockFieldTicket();
  const submitTicket = useSubmitBlockFieldTicket();
  const submitWeek = useSubmitWeeklySubmission();
  const { pendingCount, syncing, syncNow, isOnline, refreshCount } = useCropfortOfflineSync();

  const draftTickets = tickets.filter((t) => t.status === "draft");
  const submittedTickets = tickets.filter((t) => t.status === "submitted");

  const handleCreate = async () => {
    const payload = {
      ...form,
      weekEnding,
      actualQty: Number(form.actualQty),
      laborHoursActual: Number(form.laborHoursActual),
      plannedQty: form.plannedQty ? Number(form.plannedQty) : null,
    };

    if (!navigator.onLine) {
      const clientLocalId = newClientLocalId();
      await enqueueTicket({ ...payload, clientLocalId, status: "draft" });
      await refreshCount();
      toast.success("Saved offline — will sync when back online.");
      setForm({ ...emptyForm, weekEnding });
      setOpen(false);
      return;
    }

    await createTicket.mutateAsync(payload);
    setForm({ ...emptyForm, weekEnding });
    setOpen(false);
  };

  const handleSubmitWeek = async () => {
    if (!submittedTickets.length) return;
    await submitWeek.mutateAsync({
      weekEnding,
      ticketIds: submittedTickets.map((t) => t.id),
    });
  };

  if (!canEdit) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        B-Agro / field roles use this screen for weekly block ticket entry.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly entry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Block field tickets by week — elected activities only on submit (Cropfort Path B).
            Demo week: <span className="font-mono text-xs">{DEMO_WEEK}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New ticket
          </Button>
          <Button variant="outline" onClick={() => syncNow()} disabled={syncing || !pendingCount}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync ({pendingCount})
          </Button>
          <Button onClick={handleSubmitWeek} disabled={!submittedTickets.length || submitWeek.isPending}>
            <Send className="mr-2 h-4 w-4" /> Submit week ({submittedTickets.length})
          </Button>
        </div>
      </div>

      {!isOnline || pendingCount > 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
          <CloudOff className="h-4 w-4" />
          {!isOnline
            ? "Offline — new tickets queue locally until connection returns."
            : `${pendingCount} ticket(s) queued for sync.`}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Week ending (Sun)</Label>
          <Input type="date" className="w-40" value={weekEnding} onChange={(e) => setWeekEnding(e.target.value)} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Block</th>
                <th className="px-3 py-2 font-medium">Activity</th>
                <th className="px-3 py-2 font-medium text-right">Actual qty</th>
                <th className="px-3 py-2 font-medium text-right">Labor hrs</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Loading tickets…
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No tickets for this week.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{ticket.block?.code}</td>
                    <td className="px-3 py-2">{ticket.activity?.name}</td>
                    <td className="px-3 py-2 text-right">{ticket.actualQty}</td>
                    <td className="px-3 py-2 text-right">{ticket.laborHoursActual}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">
                        {ticket.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {ticket.status === "draft" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={submitTicket.isPending}
                          onClick={() => submitTicket.mutate(ticket.id)}
                        >
                          Submit
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {draftTickets.length > 0 ? (
        <p className="text-xs text-muted-foreground">{draftTickets.length} draft ticket(s) — submit each before bundling the week.</p>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="New block field ticket">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Block</Label>
              <Select value={form.blockId} onValueChange={(v) => setForm((f) => ({ ...f, blockId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.code} — {b.estateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Activity</Label>
              <Select value={form.activityId} onValueChange={(v) => setForm((f) => ({ ...f, activityId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Planned qty</Label>
              <Input
                type="number"
                min={0}
                step="0.0001"
                value={form.plannedQty ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, plannedQty: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Actual qty</Label>
              <Input
                type="number"
                min={0}
                step="0.0001"
                value={form.actualQty || ""}
                onChange={(e) => setForm((f) => ({ ...f, actualQty: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Labor hours</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.laborHoursActual || ""}
                onChange={(e) => setForm((f) => ({ ...f, laborHoursActual: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.blockId || !form.activityId || createTicket.isPending}
            >
              Save draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
