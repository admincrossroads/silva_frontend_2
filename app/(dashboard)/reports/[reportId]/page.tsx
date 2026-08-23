"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/lib/api/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { formatDate } from "@/lib/utils/format";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type FieldLog = {
  id: string;
  formType: string;
  title: string;
  blockRef: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [tab, setTab] = useState<"summary" | "logs">("summary");

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportApi.findById(reportId),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!report) return <p className="text-sm text-muted-foreground">Report not found.</p>;

  const sections = (report.sections || {}) as Record<string, unknown>;
  const monitoring = sections.monitoring_summary as Record<string, unknown> | undefined;
  const selectedLogs = (sections.selected_field_logs || []) as FieldLog[];
  const ownerActivities = (sections.owner_requested_activities || []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold capitalize">
          {report.type} report · {report.period}
        </h1>
        <StatusBadge status={report.status} />
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === "summary" ? "default" : "ghost"} size="sm" onClick={() => setTab("summary")}>
          Summary
        </Button>
        <Button variant={tab === "logs" ? "default" : "ghost"} size="sm" onClick={() => setTab("logs")}>
          Selected field logs ({selectedLogs.length})
        </Button>
      </div>

      {tab === "summary" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Executive narrative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {report.narrative || "No narrative provided."}
              </p>
            </CardContent>
          </Card>

          {monitoring ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monitoring summary</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto rounded-md bg-muted/60 p-3">
                  {JSON.stringify(monitoring, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : null}

          {ownerActivities.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner-requested activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ownerActivities.map((a) => (
                  <div key={String(a.id)} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{String(a.title)}</p>
                    <p className="text-xs text-muted-foreground">{String(a.requestType)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {selectedLogs.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No field logs were curated for this release.
              </CardContent>
            </Card>
          ) : (
            selectedLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{log.title}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {log.formType.replace(/_/g, " ")} · {log.blockRef || "—"} ·{" "}
                    {formatDate(log.createdAt)}
                  </p>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto rounded-md bg-muted/60 p-3">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
