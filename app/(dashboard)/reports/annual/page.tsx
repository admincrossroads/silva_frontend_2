"use client";

import { reportApi } from "@/lib/api/reports";
import { PeriodReportsPage } from "@/components/reports/period-reports-page";

export default function AnnualReportsPage() {
  return <PeriodReportsPage type="annual" generate={() => reportApi.generateAnnual()} />;
}
