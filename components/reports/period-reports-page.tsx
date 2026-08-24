"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "@/lib/api/reports";
import { exportApi, downloadBlob } from "@/lib/api/exports";
import type { Report } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/badges/status-badge";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import {
  formatReportPeriod,
  getReportBvaRows,
  PERIOD_REPORT_CONFIG,
  summarizeBva,
  type PeriodReportType,
} from "@/lib/reports/report-utils";
import { Download, Eye, FileText } from "lucide-react";

interface PeriodReportsPageProps {
  type: PeriodReportType;
  generate: () => Promise<Report>;
}

export function PeriodReportsPage({ type, generate }: PeriodReportsPageProps) {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const { isSilva, isSpx } = useRole();
  const canDraft = has("reports.draft") || has("reports.release");
  const config = PERIOD_REPORT_CONFIG[type];
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports", { type }],
    queryFn: () => reportApi.findAll({ type }),
  });

  const generateMutation = useMutation({
    mutationFn: generate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  const handleDownload = async (report: Report) => {
    setDownloadingId(report.id);
    try {
      const blob = await exportApi.reportPdf(report.id);
      downloadBlob(blob, `report-${report.type}-${report.period}.pdf`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={config.title}
        description={isSilva ? "Released reports from SPX with budget summary and narrative." : config.subtitle}
        actions={
          canDraft ? (
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "Generating…" : config.generateLabel}
            </Button>
          ) : undefined
        }
      />

      <PageContent>
        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">Loading reports…</p>
        ) : reports.length === 0 ? (
          <Card className="border-dashed">
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">
                {isSilva ? "No released reports yet" : `No ${type} reports yet`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSilva
                  ? "SPX will release monthly and quarterly packs here once narrative review is complete."
                  : "Generate a draft to capture budget vs actual and author the Silva-facing narrative."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => {
              const bvaRows = getReportBvaRows(report);
              const summary = summarizeBva(bvaRows);
              const canDownload = report.status === "released" || isSpx;

              return (
                <Card key={report.id} className="overflow-hidden">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-semibold">
                          {formatReportPeriod(report.period, report.type)}
                        </h2>
                        <StatusBadge status={report.status} />
                        <Badge variant="outline" className="font-mono text-[10px] font-normal">
                          {report.id}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Generated {formatDate(report.generatedAt ?? report.createdAt)}</span>
                        {report.releasedAt ? <span>Released {formatDate(report.releasedAt)}</span> : null}
                        {summary ? (
                          <>
                            <span>Budget {formatCurrency(summary.budget)}</span>
                            <span>Actual {formatCurrency(summary.actual)}</span>
                            <span>{summary.utilization}% utilized</span>
                          </>
                        ) : null}
                      </div>

                      {report.narrative ? (
                        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/90">{report.narrative}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {report.status === "draft"
                            ? "Draft awaiting SPX narrative and release."
                            : "No narrative attached."}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button asChild variant="default" size="sm">
                        <Link href={`/reports/${report.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View report
                        </Link>
                      </Button>
                      {canDownload ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadingId === report.id}
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadingId === report.id ? "Preparing…" : "PDF"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageContent>
    </PageShell>
  );
}
