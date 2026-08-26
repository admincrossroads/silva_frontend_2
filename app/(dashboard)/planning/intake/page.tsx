"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useActivityRequests,
  useConvertActivityRequest,
  useDismissActivityRequest,
  useWorkListOptions,
} from "@/hooks/use-activity-requests";
import type { ActivityRequest } from "@/lib/api/activity-requests";
import { StatusBadge } from "@/components/badges/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageShell } from "@/components/layout/page-shell";
import { PipelineStepper } from "@/components/planning/pipeline-stepper";
import { formatDate } from "@/lib/utils/format";

export default function AdHocIntakePage() {
  const { data: items = [], isLoading } = useActivityRequests({ status: "submitted" });
  const { data: workList } = useWorkListOptions();
  const convert = useConvertActivityRequest();
  const dismiss = useDismissActivityRequest();

  const [selected, setSelected] = useState<ActivityRequest | null>(null);
  const [cost, setCost] = useState("1200");
  const [discipline, setDiscipline] = useState("");
  const [afpLineId, setAfpLineId] = useState("");
  const [unlinkAfp, setUnlinkAfp] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [mode, setMode] = useState<"convert" | "dismiss">("convert");

  const silvaItems = useMemo(() => items.filter((i) => i.origin === "silva_request"), [items]);
  const vendorItems = useMemo(() => items.filter((i) => i.origin === "vendor_request"), [items]);

  const openConvert = (row: ActivityRequest) => {
    setSelected(row);
    setMode("convert");
    setUnlinkAfp(false);
    setAfpLineId(row.suggestedAfpLineId || "");
    setDiscipline(row.suggestedAfpLine?.operatingDiscipline || "Quality");
    setCost("1200");
  };

  const openDismiss = (row: ActivityRequest) => {
    setSelected(row);
    setMode("dismiss");
    setDismissReason("");
  };

  const submitConvert = async () => {
    if (!selected) return;
    await convert.mutateAsync({
      id: selected.id,
      estimatedCostUsd: Number(cost),
      operatingDiscipline: discipline || "Quality",
      afpLineId: unlinkAfp ? null : afpLineId || null,
      unlinkAfp,
    });
    setSelected(null);
  };

  const submitDismiss = async () => {
    if (!selected || !dismissReason.trim()) return;
    await dismiss.mutateAsync({ id: selected.id, reason: dismissReason.trim() });
    setSelected(null);
  };

  const RequestStack = ({ title, rows }: { title: string; rows: ActivityRequest[] }) => (
    <Card className="overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{rows.length} waiting</p>
      </div>
      <div className="divide-y">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Queue clear</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium truncate">{row.title}</span>
                  <StatusBadge status={row.status} />
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {row.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {row.requestedBy?.name || row.origin} · {formatDate(row.createdAt)}
                  {row.suggestedAfpLineId ? ` · AFP ${row.suggestedAfpLineId}` : " · no AFP yet"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openConvert(row)}>
                  Convert
                </Button>
                <Button size="sm" variant="outline" onClick={() => openDismiss(row)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );

  return (
    <PageShell>
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Ad-hoc intake</h1>
        <PipelineStepper activeIndex={0} />
        <p className="text-sm text-muted-foreground">
          Triage Silva and vendor requests into draft AFEs. Then run Schedule 3 as usual.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading intake…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <RequestStack title="Silva requests" rows={silvaItems} />
          <RequestStack title="Vendor requests" rows={vendorItems} />
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={mode === "convert" ? "Convert to AFE" : "Dismiss request"}
      >
        {selected && mode === "convert" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected.title}</p>
            <div className="space-y-1.5">
              <Label>Estimated cost (USD)</Label>
              <Input type="number" min={1} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Operating discipline</Label>
              <Input value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>AFP line</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                disabled={unlinkAfp}
                value={afpLineId}
                onChange={(e) => setAfpLineId(e.target.value)}
              >
                <option value="">— Select —</option>
                {(workList?.afpLines || []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} — {l.activity}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={unlinkAfp}
                onChange={(e) => setUnlinkAfp(e.target.checked)}
              />
              <span>
                Create standalone ad-hoc AFE (no AFP).{" "}
                <span className="text-amber-700 dark:text-amber-400">
                  Prefer linking an AFP for budget discipline.
                </span>
              </span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button disabled={convert.isPending || !(Number(cost) > 0)} onClick={submitConvert}>
                {convert.isPending ? "Converting…" : "Create draft AFE"}
              </Button>
            </div>
            {convert.data?.convertedAfeId || (convert.data as { convertedAfeId?: string } | undefined)?.convertedAfeId ? (
              <Button variant="link" asChild className="px-0">
                <Link href={`/planning/afe/${(convert.data as ActivityRequest).convertedAfeId}`}>Open AFE</Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {selected && mode === "dismiss" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected.title}</p>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Input value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={dismiss.isPending || !dismissReason.trim()}
                onClick={submitDismiss}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageShell>
  );
}
