"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Send } from "lucide-react";
import {
  useCropfortAfes,
  useCropfortAfeBandPreview,
  useCreateCropfortAfe,
  useSubmitCropfortAfes,
} from "@/hooks/use-cropfort-afes";
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
import type { CreateCropfortAfeDto, CropfortAfeSourceType } from "@/lib/api/cropfort/afes";
import { cn } from "@/lib/utils";

const STATUSES = ["draft", "submitted", "approved", "returned"] as const;
const BANDS = ["A", "B", "C", "D"] as const;
const SOURCE_TYPES: CropfortAfeSourceType[] = ["manual", "afp_line", "weekly_submission", "intervention", "project"];

function sourceLabel(sourceType: CropfortAfeSourceType) {
  if (sourceType === "intervention") return "Intervention";
  if (sourceType === "project") return "Project";
  return sourceType.replace(/_/g, " ");
}

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(
    value,
  );
}

const emptyForm: CreateCropfortAfeDto = {
  title: "",
  amountEtb: 0,
  sourceType: "manual",
};

export default function CropfortAfePage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const { isSpx, isSystemAdmin } = useRole();
  const canEdit = isSpx || isSystemAdmin;
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [bandFilter, setBandFilter] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateCropfortAfeDto>(emptyForm);

  const { data: afes = [], isLoading } = useCropfortAfes({ status: statusFilter, band: bandFilter });
  const { data: bandPreview } = useCropfortAfeBandPreview(form.amountEtb > 0 ? form.amountEtb : undefined);
  const createAfe = useCreateCropfortAfe();
  const submitAfes = useSubmitCropfortAfes();

  const draftIds = useMemo(() => afes.filter((a) => a.status === "draft").map((a) => a.id), [afes]);

  const handleCreate = async () => {
    await createAfe.mutateAsync({ ...form, amountEtb: Number(form.amountEtb) });
    setForm(emptyForm);
    setOpen(false);
  };

  const handleSubmitAll = async () => {
    if (!draftIds.length) return;
    await submitAfes.mutateAsync(draftIds);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cropfort AFE</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Birr commitments with bands A–D (≤500k / ≤2M / ≤5M / above) — server-computed per program config.
          </p>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New AFE
            </Button>
            <Button onClick={handleSubmitAll} disabled={!draftIds.length || submitAfes.isPending}>
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
        <Select value={bandFilter ?? "all"} onValueChange={(v) => setBandFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Band" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bands</SelectItem>
            {BANDS.map((b) => (
              <SelectItem key={b} value={b}>
                Band {b}
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
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium text-right">Amount ETB</th>
                <th className="px-3 py-2 font-medium">Band</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Loading AFEs…
                  </td>
                </tr>
              ) : afes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No Cropfort AFEs yet.
                  </td>
                </tr>
              ) : (
                afes.map((afe) => (
                  <tr
                    key={afe.id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30",
                      highlightId === afe.id && "bg-primary/5",
                    )}
                  >
                    <td className="px-3 py-2">{afe.title}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatEtb(afe.amountEtb)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">Band {afe.band}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground capitalize">
                      {sourceLabel(afe.sourceType)}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">
                        {afe.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {(afe.sourceType === "intervention" || afe.sourceType === "project") && afe.sourceId ? (
                        <Link className="text-primary underline" href="/operations/interventions">
                          Core op
                        </Link>
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

      <Modal open={open} onClose={() => setOpen(false)} title="New Cropfort AFE">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Amount (ETB)</Label>
              <Input
                type="number"
                min={0}
                step="1"
                value={form.amountEtb || ""}
                onChange={(e) => setForm((f) => ({ ...f, amountEtb: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Computed band</Label>
              <div className="flex h-10 items-center">
                {bandPreview ? (
                  <Badge>Band {bandPreview.band}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Enter amount</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Source type</Label>
            <Select
              value={form.sourceType}
              onValueChange={(v) => setForm((f) => ({ ...f, sourceType: v as CropfortAfeSourceType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {sourceLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.amountEtb || createAfe.isPending}>
              Save draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
