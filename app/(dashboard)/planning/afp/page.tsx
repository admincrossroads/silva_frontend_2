"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { AfpBlocksPanel } from "@/components/cropfort/afp-blocks-panel";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { useRole } from "@/hooks/use-role";

export default function AnnualPlanPage() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const searchParams = useSearchParams();
  const currentYear = new Date().getUTCFullYear();
  const yearFromQuery = Number(searchParams.get("year"));
  const queryYear =
    Number.isFinite(yearFromQuery) && yearFromQuery >= 2000 && yearFromQuery <= 2100
      ? yearFromQuery
      : null;
  const [year, setYear] = useState(queryYear ?? currentYear);

  useEffect(() => {
    if (queryYear != null) setYear(queryYear);
  }, [queryYear]);

  const yearOptions = useMemo(() => {
    const set = new Set([currentYear - 1, currentYear, currentYear + 1, year]);
    return [...set].sort((a, b) => a - b);
  }, [currentYear, year]);
  const allowed = isSilva || isSpx || isSystemAdmin;

  if (!allowed) {
    return (
      <PageShell>
        <PageHeader title="Annual plan" />
        <p className="text-sm text-muted-foreground">You do not have access.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Annual plan"
        actions={
          <Select
            id="plan-year"
            label="Year"
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-32"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        }
      />
      <AfpBlocksPanel planYear={year} />
    </PageShell>
  );
}
