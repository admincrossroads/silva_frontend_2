"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "@/lib/api/reports";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Report } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function NarrativeWorkspacePage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const canDraft = has("reports.draft") || has("reports.release");
  const canRelease = has("reports.release");
  const [narrativeDrafts, setNarrativeDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string>("");

  const { data: drafts = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports", { status: "draft" }],
    queryFn: () => reportApi.findAll({ status: "draft" }),
  });

  const queue = useMemo(
    () => [...drafts].sort((a, b) => a.type.localeCompare(b.type) || a.period.localeCompare(b.period)),
    [drafts],
  );

  const selected = queue.find((r) => r.id === activeId) ?? queue[0];

  const saveNarrative = useMutation({
    mutationFn: ({ id, narrative }: { id: string; narrative: string }) =>
      reportApi.patchNarrative(id, narrative),
    meta: { successMessage: "Narrative saved", errorMessage: "Could not save narrative" },
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not save narrative")),
  });

  const release = useMutation({
    mutationFn: (id: string) => reportApi.release(id),
    meta: { successMessage: "Report released", errorMessage: "Could not release report" },
    onSuccess: () => {
      setError("");
      setActiveId("");
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not release report")),
  });

  const narrative = selected
    ? narrativeDrafts[selected.id] ?? selected.narrative ?? ""
    : "";

  return (
    <PageShell>
      <PageHeader title="Narrative workspace" />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <PageContent>
      {isLoading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No draft reports in the queue. Generate a period report to start.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Queue ({queue.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2 pt-0">
              {queue.map((r) => {
                const isActive = (selected?.id ?? "") === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveId(r.id)}
                    className={`flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? "bg-primary/10 text-foreground" : "hover:bg-muted/60"
                    }`}
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block font-medium capitalize">{r.type}</span>
                      <span className="block text-xs text-muted-foreground">{r.period}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base capitalize">
                  {selected.type} · {selected.period}
                  <StatusBadge status={selected.status} />
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Generated {formatDate(selected.generatedAt ?? selected.createdAt)}
                </p>
                <Link href={`/reports/${selected.id}`} className="text-xs font-medium text-primary hover:underline">
                  Open full report
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {canDraft ? (
                  <>
                    <Textarea
                      label="SPX narrative"
                      value={narrative}
                      onChange={(e) =>
                        setNarrativeDrafts((prev) => ({
                          ...prev,
                          [selected.id]: e.target.value,
                        }))
                      }
                      placeholder="Author the interpretive layer before release to Silva…"
                      className="min-h-[160px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        disabled={saveNarrative.isPending}
                        onClick={() =>
                          saveNarrative.mutate({ id: selected.id, narrative })
                        }
                      >
                        Save narrative
                      </Button>
                      {canRelease ? (
                        <Button
                          disabled={release.isPending || !narrative.trim()}
                          onClick={() => release.mutate(selected.id)}
                        >
                          Release to Silva
                        </Button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {selected.narrative || "No narrative yet."}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
      </PageContent>
    </PageShell>
  );
}
