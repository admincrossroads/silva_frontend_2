"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "@/lib/api/reports";
import { Report } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { FileText } from "lucide-react";

export default function MonthlyReportsPage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const canDraft = has("reports.draft") || has("reports.release");
  const canRelease = has("reports.release");
  const [narrativeDrafts, setNarrativeDrafts] = useState<Record<string, string>>({});

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports", { type: "monthly" }],
    queryFn: () => reportApi.findAll({ type: "monthly" }),
  });

  const generate = useMutation({
    mutationFn: () => reportApi.generateMonthly(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  const saveNarrative = useMutation({
    mutationFn: ({ id, narrative }: { id: string; narrative: string }) =>
      reportApi.patchNarrative(id, narrative),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  const release = useMutation({
    mutationFn: (id: string) => reportApi.release(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Cost & Progress</h1>
          <p className="text-sm text-muted-foreground">
            Draft auto-generates from system data. SPX must author a narrative and explicitly release before Silva sees
            it.
          </p>
        </div>
        {canDraft && (
          <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
            Generate draft
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No monthly reports yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((r) => {
            const narrative = narrativeDrafts[r.id] ?? r.narrative ?? "";
            return (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    {r.period}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                  {canDraft && r.status === "draft" ? (
                    <>
                      <Textarea
                        label="SPX narrative"
                        value={narrative}
                        onChange={(e) =>
                          setNarrativeDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                        placeholder="Interpret trends, risks, and recommendations before release…"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={saveNarrative.isPending}
                          onClick={() => saveNarrative.mutate({ id: r.id, narrative })}
                        >
                          Save narrative
                        </Button>
                        {canRelease && (
                          <Button
                            size="sm"
                            disabled={release.isPending || !narrative.trim()}
                            onClick={() => release.mutate(r.id)}
                          >
                            Release to Silva
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    r.narrative && (
                      <p className="text-sm text-muted-foreground line-clamp-3 pt-1">{r.narrative}</p>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
