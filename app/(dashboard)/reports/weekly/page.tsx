"use client";

import { reportApi } from "@/lib/api/reports";
import { PeriodReportsPage } from "@/components/reports/period-reports-page";

export default function WeeklyReportsPage() {
  return <PeriodReportsPage type="weekly" generate={() => reportApi.generateWeekly()} />;
}
