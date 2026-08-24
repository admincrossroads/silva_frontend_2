"use client";

import { reportApi } from "@/lib/api/reports";
import { PeriodReportsPage } from "@/components/reports/period-reports-page";

export default function QuarterlyReportsPage() {
  return <PeriodReportsPage type="quarterly" generate={() => reportApi.generateQuarterly()} />;
}
