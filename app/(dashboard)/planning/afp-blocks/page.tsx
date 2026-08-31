"use client";

import { useMemo, useState } from "react";
import { Plus, Send } from "lucide-react";
import {
  useAfpBlockLines,
  useCreateAfpBlockLine,
  useSubmitAfpBlockLines,
  useUpdateAfpBlockElection,
} from "@/hooks/use-afp-blocks";
import { useActivityMaster } from "@/hooks/use-activity-master";
import { useBudgetPreview } from "@/hooks/use-budget-preview";
import { useFarmEstates } from "@/hooks/use-farm-estates";
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
import type { CreateAfpBlockLineDto } from "@/lib/api/cropfort/afp-blocks";

const STATUSES = ["draft", "submitted", "approved", "returned"] as const;
const currentYear = new Date().getFullYear();

function formatEtb(value: number | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(
    value,
  );
}

const emptyForm: CreateAfpBlockLineDto = {
  planYear: currentYear,
  blockId: "",
  activityId: "",
  plannedQty: 0,
  sequence: 0,
};

export default function AfpBlocksPage() {
  const { isSpx, isSystemAdmin, isSilva } = useRole();
  const canEdit = isSpx || isSystemAdmin;
  const canElect = canEdit || isSilva;
  const [planYear, setPlanYear] = useState(currentYear);
  const [blockFilter, setBlockFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateAfpBlockLineDto>(emptyForm);

  const { data: estates = [] } = useFarmEstates();
  const blocks = useMemo(
    () => estates.flatMap((e) => e.blocks.map((b) => ({ ...b, estateName: e.name }))),
    [estates],
  );
  const { data: activities = [] } = useActivityMaster();
  const { data: lines = [], isLoading } = useAfpBlockLines({
    planYear,
    blockId: blockFilter,
    status: statusFilter,
  });
  const { data: budget } = useBudgetPreview({ planYear, blockId: blockFilter });
  const createLine = useCreateAfpBlockLine();
  const submitLines = useSubmitAfpBlockLines();
  const updateElection = useUpdateAfpBlockElection();

  const draftIds = useMemo(() => lines.filter((l) => l.status === "draft").map((l) => l.id), [lines]);

  const handleCreate = async () => {
    await createLine.mutateAsync({
      ...form,
      planYear,
      plannedQty: Number(form.plannedQty),
      sequence: Number(form.sequence ?? 0),
    });
    setForm(emptyForm);
    setOpen(false);
  };

  const handleSubmitAll = async () => {
    if (!draftIds.length) return;
    await submitLines.mutateAsync(draftIds);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Block AFP</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Block-level annual plan lines with election gate — budget derived from approved rates (Cropfort).
          </p>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add line
            </Button>
            <Button onClick={handleSubmitAll} disabled={!draftIds.length || submitLines.isPending}>
              <Send className="mr-2 h-4 w-4" /> Submit drafts ({draftIds.length})
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          type="number"
          className="w-28"
          value={planYear}
          onChange={(e) => setPlanYear(Number(e.target.value) || currentYear)}
        />
        <Select value={blockFilter ?? "all"} onValueChange={(v) => setBlockFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All blocks</SelectItem>
            {blocks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.code} ({b.estateName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter ?? "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-dashed bg-muted/20 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget preview (ETB)</p>
            <p className="mt-1 text-2xl font-semibold">{formatEtb(budget?.totals.totalCostEtb)}</p>
            <p className="text-xs text-muted-foreground">
              Labor {formatEtb(budget?.totals.laborCostEtb)} · Material {formatEtb(budget?.totals.materialCostEtb)}
            </p>
          </div>
          <p className="max-w-md text-xs text-muted-foreground">
            Derived from approved + elected lines only. Totals are never stored — computed server-side per FR-BUD-001.
          </p>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Block</th>
                <th className="px-3 py-2 font-medium">Activity</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium">Election</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Loading block lines…
                  </td>
                </tr>
              ) : lines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No block AFP lines yet.
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{line.block?.code ?? line.blockId}</td>
                    <td className="px-3 py-2">
                      <div>{line.activity?.name ?? line.activityId}</div>
                      <div className="text-xs text-muted-foreground">{line.activity?.code}</div>
                    </td>
                    <td className="px-3 py-2 text-right">{line.plannedQty}</td>
                    <td className="px-3 py-2">
                      <Badge variant={line.electionStatus === "elected" ? "default" : "outline"} className="capitalize">
                        {line.electionStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">
                        {line.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {canElect && line.electionStatus === "suggested" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateElection.isPending}
                          onClick={() => updateElection.mutate({ lineId: line.id, electionStatus: "elected" })}
                        >
                          Elect
                        </Button>
                      ) : canElect && line.electionStatus === "elected" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updateElection.isPending}
                          onClick={() => updateElection.mutate({ lineId: line.id, electionStatus: "suggested" })}
                        >
                          Un-elect
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

      <Modal open={open} onClose={() => setOpen(false)} title="New block AFP line">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Planned quantity</Label>
              <Input
                type="number"
                min={0}
                step="0.0001"
                value={form.plannedQty || ""}
                onChange={(e) => setForm((f) => ({ ...f, plannedQty: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sequence</Label>
              <Input
                type="number"
                min={0}
                value={form.sequence ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, sequence: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.blockId || !form.activityId || !form.plannedQty || createLine.isPending}
            >
              Save draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
