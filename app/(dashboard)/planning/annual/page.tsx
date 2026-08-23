"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAfps } from "@/hooks/use-afps";
import { dashboardApi } from "@/lib/api/dashboard";
import { seasonCalendarApi } from "@/lib/api/field-ops";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { afpColumns } from "@/components/data-table/columns/afp-columns";
import { formatCurrency } from "@/lib/utils/format";
import { StatusBadge } from "@/components/badges/status-badge";

const TABS = [
  { id: "lines", label: "Plan lines" },
  { id: "schedule", label: "Season schedule" },
  { id: "summary", label: "Year summary" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type SeasonWindow = {
  id: string;
  operatingDiscipline: string;
  activity: string;
  weekStart: number;
  weekEnd: number;
  status: string;
};

type SeasonCalendar = {
  id: string;
  year: number;
  name: string;
  windows?: SeasonWindow[];
};

export default function AnnualPlanningPage() {
  const year = new Date().getUTCFullYear();
  const [tab, setTab] = useState<TabId>("lines");

  const { data: afps = [] } = useAfps({ year });
  const calendarsQuery = useQuery<SeasonCalendar[]>({
    queryKey: ["season-calendars", year],
    queryFn: () => seasonCalendarApi.findAll({ year }),
  });
  const summaryQuery = useQuery({
    queryKey: ["bva-summary", year],
    queryFn: () => dashboardApi.budgetVsActualSummary(year),
  });

  const calendars = calendarsQuery.data ?? [];
  const windows = calendars.flatMap((c) =>
    (c.windows || []).map((w) => ({ ...w, calendarName: c.name, calendarYear: c.year })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Annual plan · {year}</h1>
        <p className="text-sm text-muted-foreground">
          SPX proactive desk: AFP budget lines, season windows, and year rollup. Ad-hoc intake lives
          separately under{" "}
          <Link href="/planning/intake" className="text-primary underline">
            Ad-hoc intake
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {TABS.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "lines" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Draft and submit AFP lines for Silva envelope approval.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/planning/afp">Open AFP register</Link>
            </Button>
          </div>
          <DataTable columns={afpColumns} data={afps} searchKey="activity" />
        </div>
      )}

      {tab === "schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Season windows linked to planned work — issue when the year opens.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/execution/calendar">Manage calendar</Link>
            </Button>
          </div>
          {windows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No season windows for {year}. Create a calendar and add windows.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {windows.map((w) => (
                <Card key={w.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      <span>{w.activity}</span>
                      <StatusBadge status={w.status} />
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {w.operatingDiscipline} · W{w.weekStart}–W{w.weekEnd}
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "summary" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget envelope · {year}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading summary…</p>
            ) : summaryQuery.data ? (
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Allocated", summaryQuery.data.totalBudgetUsd],
                  ["Actual", summaryQuery.data.totalActualUsd],
                  ["Watch lines", summaryQuery.data.watchCount],
                  ["Over budget", summaryQuery.data.overBudgetCount],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-lg font-semibold">
                      {typeof value === "number" ? formatCurrency(value) : value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No budget summary available.</p>
            )}
            <Button asChild variant="secondary" size="sm">
              <Link href="/reports/budget-vs-actual">Full budget vs actual</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
