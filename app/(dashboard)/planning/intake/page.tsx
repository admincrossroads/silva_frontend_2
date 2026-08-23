"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityRequestApi, type ActivityRequest } from "@/lib/api/activity-requests";
import { afeApi } from "@/lib/api/afe";
import { afpApi } from "@/lib/api/afp";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select-native";
import { StatusBadge } from "@/components/badges/status-badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils/format";

type VendorAfe = {
  id: string;
  description: string;
  status: string;
  origin: string;
  planningMode: string;
  estimatedCostUsd: number;
  createdAt: string;
};

export default function PlannerIntakePage() {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [convertId, setConvertId] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState("Quality");
  const [cost, setCost] = useState("1500");
  const [afpLineId, setAfpLineId] = useState("");
  const [dismissId, setDismissId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState("");

  const requestsQuery = useQuery<ActivityRequest[]>({
    queryKey: ["activity-requests", "intake"],
    queryFn: () => activityRequestApi.findAll({ status: "submitted" }),
  });
  const vendorQuery = useQuery<VendorAfe[]>({
    queryKey: ["afe-intake-vendor"],
    queryFn: () => afeApi.listIntakeVendor(),
  });
  const afpQuery = useQuery({
    queryKey: ["afp-lines-intake"],
    queryFn: () => afpApi.findAll({ status: "approved" }),
  });

  const convert = useMutation({
    mutationFn: (id: string) =>
      activityRequestApi.convert(id, {
        operatingDiscipline: discipline,
        estimatedCostUsd: Number(cost),
        afpLineId: afpLineId || null,
      }),
    onSuccess: () => {
      setError("");
      setConvertId(null);
      qc.invalidateQueries({ queryKey: ["activity-requests"] });
      qc.invalidateQueries({ queryKey: ["afes"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not convert request")),
  });

  const dismiss = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      activityRequestApi.dismiss(id, reason),
    onSuccess: () => {
      setError("");
      setDismissId(null);
      setDismissReason("");
      qc.invalidateQueries({ queryKey: ["activity-requests"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not dismiss request")),
  });

  const silvaQueue = requestsQuery.data ?? [];
  const vendorQueue = vendorQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ad-hoc intake</h1>
        <p className="text-sm text-muted-foreground">
          Silva activity requests and B-Agro manager AFE drafts — separate from the annual plan desk.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Silva activity requests ({silvaQueue.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {silvaQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open Silva requests.</p>
          ) : (
            silvaQueue.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {r.requestType.replace(/_/g, " ")} · {r.urgency} · {formatDate(r.createdAt)}
                  </p>
                  <p className="mt-1 text-sm">{r.description}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={r.status} />
                  <Button size="sm" onClick={() => setConvertId(r.id)}>
                    Convert to AFE
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setDismissId(r.id)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor-originated AFE drafts ({vendorQueue.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendorQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendor drafts awaiting triage.</p>
          ) : (
            vendorQueue.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{a.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.origin} · {formatDate(a.createdAt)} · ${a.estimatedCostUsd.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  <Button asChild size="sm" variant="secondary">
                    <a href={`/planning/afe/${a.id}`}>Review AFE</a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal
        title="Convert to ad-hoc AFE"
        description="Standalone by default — optionally link an existing AFP line."
        isOpen={Boolean(convertId)}
        onClose={() => setConvertId(null)}
      >
        <div className="space-y-4">
          <NativeSelect
            label="Operating discipline"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
          >
            {["Quality", "Agronomic Operations", "Infrastructure", "Harvest"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </NativeSelect>
          <Input
            label="Estimated cost (USD)"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <NativeSelect
            label="Link AFP line (optional)"
            value={afpLineId}
            onChange={(e) => setAfpLineId(e.target.value)}
          >
            <option value="">Standalone ad-hoc (no AFP link)</option>
            {(afpQuery.data ?? []).map((line: { id: string; activity: string }) => (
              <option key={line.id} value={line.id}>
                {line.activity}
              </option>
            ))}
          </NativeSelect>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConvertId(null)}>
              Cancel
            </Button>
            <Button
              disabled={convert.isPending || !convertId}
              onClick={() => convertId && convert.mutate(convertId)}
            >
              Create ad-hoc AFE
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Dismiss request"
        isOpen={Boolean(dismissId)}
        onClose={() => setDismissId(null)}
      >
        <div className="space-y-4">
          <Textarea
            label="Reason"
            value={dismissReason}
            onChange={(e) => setDismissReason(e.target.value)}
            placeholder="Why this request will not proceed…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDismissId(null)}>
              Cancel
            </Button>
            <Button
              disabled={dismiss.isPending || !dismissReason.trim() || !dismissId}
              onClick={() => dismissId && dismiss.mutate({ id: dismissId, reason: dismissReason })}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
