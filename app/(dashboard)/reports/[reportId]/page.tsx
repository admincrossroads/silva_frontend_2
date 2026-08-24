"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/lib/api/reports";
import type { Report } from "@/types";
import { ReportDetailView } from "@/components/reports/report-detail-view";
import { PageLoading, PageShell } from "@/components/layout/page-shell";
import { PERIOD_REPORT_CONFIG, type PeriodReportType } from "@/lib/reports/report-utils";

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { data: report, isLoading } = useQuery<Report>({
    queryKey: ["reports", reportId],
    queryFn: () => reportApi.findById(reportId),
    enabled: Boolean(reportId),
  });

  if (isLoading || !report) {
    return (
      <PageShell>
        <PageLoading label="Loading report…" />
      </PageShell>
    );
  }

  const config = PERIOD_REPORT_CONFIG[report.type as PeriodReportType];
  const backHref = config ? `/reports/${report.type}` : "/reports/monthly";

  return (
    <ReportDetailView
      report={report}
      backHref={backHref}
      backLabel={config?.title ?? "Reports"}
    />
  );
}
