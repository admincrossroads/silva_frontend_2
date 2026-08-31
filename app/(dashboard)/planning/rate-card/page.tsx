"use client";

import { useMemo, useState } from "react";
import { Plus, Send } from "lucide-react";
import { useRateCardLines, useCreateRateCardLine, useSubmitRateCard } from "@/hooks/use-rate-card";
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
import { Textarea } from "@/components/ui/textarea";
import type { CreateRateCardLineDto } from "@/lib/api/cropfort/rate-card";

const STATUSES = ["draft", "submitted", "approved", "returned"] as const;

function formatEtb(value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(n);
}

const emptyForm: CreateRateCardLineDto = {
  resourceCode: "",
  resourceName: "",
  unitOfMeasure: "",
  rateEtb: 0,
  benchmarkFarmARate: null,
  benchmarkFarmBRate: null,
  spxJustificationNote: "",
};

export default function RateCardPage() {
  const { isSpx, isSystemAdmin } = useRole();
  const canEdit = isSpx || isSystemAdmin;
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateRateCardLineDto>(emptyForm);

  const { data: lines = [], isLoading } = useRateCardLines(statusFilter);
  const createLine = useCreateRateCardLine();
  const submitCard = useSubmitRateCard();

  const draftIds = useMemo(() => lines.filter((l) => l.status === "draft").map((l) => l.id), [lines]);

  const handleCreate = async () => {
    await createLine.mutateAsync({
      ...form,
      rateEtb: Number(form.rateEtb),
      benchmarkFarmARate: form.benchmarkFarmARate ? Number(form.benchmarkFarmARate) : null,
      benchmarkFarmBRate: form.benchmarkFarmBRate ? Number(form.benchmarkFarmBRate) : null,
    });
    setForm(emptyForm);
    setOpen(false);
  };

  const handleSubmitAll = async () => {
    if (!draftIds.length) return;
    await submitCard.mutateAsync(draftIds);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rate card</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Benchmarked ETB rates for Chaka Buna — variance computed server-side (Cropfort).
          </p>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add line
            </Button>
            <Button onClick={handleSubmitAll} disabled={!draftIds.length || submitCard.isPending}>
              <Send className="mr-2 h-4 w-4" /> Submit drafts ({draftIds.length})
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Resource</th>
                <th className="px-3 py-2 font-medium">UoM</th>
                <th className="px-3 py-2 font-medium text-right">Rate ETB</th>
                <th className="px-3 py-2 font-medium text-right">Variance %</th>
                <th className="px-3 py-2 font-medium">Flag</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Justification</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    Loading rate card…
                  </td>
                </tr>
              ) : lines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    No rate lines yet. {canEdit ? "Add draft lines and submit for Silva approval." : ""}
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{line.resourceCode}</td>
                    <td className="px-3 py-2">{line.resourceName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{line.unitOfMeasure}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatEtb(line.rateEtb)}</td>
                    <td className="px-3 py-2 text-right">
                      {line.variancePct != null ? `${Number(line.variancePct).toFixed(2)}%` : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {line.isFlagged ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Flagged
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {line.status}
                      </Badge>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground">
                      {line.spxJustificationNote || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New rate card line">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Resource code</Label>
              <Input
                value={form.resourceCode}
                onChange={(e) => setForm((f) => ({ ...f, resourceCode: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit of measure</Label>
              <Input
                value={form.unitOfMeasure}
                onChange={(e) => setForm((f) => ({ ...f, unitOfMeasure: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Resource name</Label>
            <Input
              value={form.resourceName}
              onChange={(e) => setForm((f) => ({ ...f, resourceName: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Rate (ETB)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.rateEtb || ""}
                onChange={(e) => setForm((f) => ({ ...f, rateEtb: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Benchmark A</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.benchmarkFarmARate ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    benchmarkFarmARate: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Benchmark B</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.benchmarkFarmBRate ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    benchmarkFarmBRate: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Justification (required if flagged on submit)</Label>
            <Textarea
              rows={3}
              value={form.spxJustificationNote ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, spxJustificationNote: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createLine.isPending}>
              Save draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
