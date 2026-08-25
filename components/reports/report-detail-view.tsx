"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Report } from "@/types";
import { reportApi } from "@/lib/api/reports";
import { exportApi, downloadBlob } from "@/lib/api/exports";
import { ReportBvaTable } from "@/components/reports/report-bva-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/badges/status-badge";
import { DetailPageHeader, PageShell } from "@/components/layout/page-shell";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { useRole } from "@/hooks/use-role";
import {
  downloadReportCsv,
  formatReportPeriod,
  getReportBvaRows,
  PERIOD_REPORT_CONFIG,
  summarizeBva,
  type PeriodReportType,
} from "@/lib/reports/report-utils";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";

interface ReportDetailViewProps {
  report: Report;
  backHref: string;
  backLabel: string;
}

export function ReportDetailView({ report, backHref, backLabel }: ReportDetailViewProps) {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const { isSilva, isSpx } = useRole();
  const canDraft = has("reports.draft") || has("reports.release");
  const canRelease = has("reports.release");
  const [narrative, setNarrative] = useState(report.narrative ?? "");
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);

  const config = PERIOD_REPORT_CONFIG[report.type as PeriodReportType];
  const bvaRows = getReportBvaRows(report);
  const summary = summarizeBva(bvaRows);
  const canDownload = report.status === "released" || isSpx;

  const saveNarrative = useMutation({
    mutationFn: () => reportApi.patchNarrative(report.id, narrative),
    meta: { successMessage: "Narrative saved", errorMessage: "Could not save narrative" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  const release = useMutation({
    mutationFn: () => reportApi.release(report.id),
    meta: { successMessage: "Report released", errorMessage: "Could not release report" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  const handlePdfDownload = async () => {
    setDownloading("pdf");
    try {
      const blob = await exportApi.reportPdf(report.id);
      downloadBlob(blob, `report-${report.type}-${report.period}.pdf`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <PageShell>
      <DetailPageHeader
        title={config?.title ?? `${report.type} report`}
        backHref={backHref}
        backLabel={backLabel}
        badges={
          <>
            <Badge variant="secondary" className="font-mono text-[10px] font-normal">{report.id}</Badge>
            <StatusBadge status={report.status} />
          </>
        }
        actions={
          canDownload ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={downloading !== null} onClick={handlePdfDownload}>
                <Download className="mr-2 h-4 w-4" />
                {downloading === "pdf" ? "Preparing…" : "Download PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={downloading !== null}
                onClick={() => downloadReportCsv(report, bvaRows)}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          ) : undefined
        }
      />

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reporting period</p>
            <p className="mt-1 font-display text-2xl font-semibold">{formatReportPeriod(report.period, report.type)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generated {formatDate(report.generatedAt ?? report.createdAt)}
              {report.releasedAt ? ` · Released ${formatDate(report.releasedAt)}` : ""}
            </p>
          </div>
          <Badge variant="outline" className="gap-1 py-1 capitalize">
            <FileText className="h-3 w-3" />
            {report.type}
          </Badge>
        </div>
      </Card>

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Budget (USD)" value={formatCurrency(summary.budget)} />
          <MetricCard label="Committed (USD)" value={formatCurrency(summary.committed)} />
          <MetricCard label="Actual (USD)" value={formatCurrency(summary.actual)} />
          <MetricCard label="Utilization" value={`${summary.utilization}%`} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SPX narrative
            </h3>
            {canDraft && report.status === "draft" ? (
              <div className="space-y-3">
                <Textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Interpret trends, risks, and recommendations before release to Silva…"
                  rows={6}
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={saveNarrative.isPending}
                    onClick={() => saveNarrative.mutate()}
                  >
                    Save narrative
                  </Button>
                  {canRelease ? (
                    <Button
                      size="sm"
                      disabled={release.isPending || !narrative.trim()}
                      onClick={() => release.mutate()}
                    >
                      Release to Silva
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : report.narrative ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.narrative}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isSilva
                  ? "No narrative was attached to this release."
                  : "Add a narrative before releasing this report to Silva."}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget vs actual
            </h3>
            <ReportBvaTable rows={bvaRows} />
          </Card>
        </div>

        <Card className="p-5 lg:sticky lg:top-20 lg:self-start">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Report pack</h3>
          <dl className="space-y-3 text-sm">
            <InfoLine label="Report ID" value={report.id} mono />
            <InfoLine label="Type" value={report.type} capitalize />
            <InfoLine label="Period" value={report.period} />
            <InfoLine label="Status" value={report.status} capitalize />
            <InfoLine label="AFP lines" value={String(bvaRows.length)} />
            <InfoLine label="Visible to Silva" value={report.visibleToSilva ? "Yes" : "No"} />
          </dl>

          {canDownload ? (
            <div className="mt-6 space-y-2 border-t pt-4">
              <Button className="w-full" variant="secondary" disabled={downloading !== null} onClick={handlePdfDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button className="w-full" variant="outline" onClick={() => downloadReportCsv(report, bvaRows)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          ) : (
            <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
              This draft is visible to SPX only until it is released.
            </p>
          )}

          <Link
            href={backHref}
            className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to {backLabel.toLowerCase()}
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function InfoLine({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right font-medium ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
