"use client";

import { reportApi } from "@/lib/api/reports";
import { PeriodReportsPage } from "@/components/reports/period-reports-page";

export default function MonthlyReportsPage() {
  return <PeriodReportsPage type="monthly" generate={() => reportApi.generateMonthly()} />;
}
