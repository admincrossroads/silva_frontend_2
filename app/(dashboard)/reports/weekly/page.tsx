"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "@/lib/api/reports";
import { Report } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { FileText } from "lucide-react";

export default function WeeklyReportsPage() {
  const qc = useQueryClient();
  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports", { type: "weekly" }],
    queryFn: () => reportApi.findAll({ type: "weekly" }),
  });

  const generate = useMutation({
    mutationFn: () => reportApi.generateWeekly(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Reports</h1>
          <p className="text-sm text-muted-foreground">View and generate weekly operations reports</p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
          Generate
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No weekly reports yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <a href={`/reports/${r.id}`} className="block">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  {r.period}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                {r.narrative && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-1">{r.narrative}</p>
                )}
              </CardContent>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
