"use client";

import { useState } from "react";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { AfpBlocksPanel } from "@/components/cropfort/afp-blocks-panel";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { useRole } from "@/hooks/use-role";

export default function AnnualPlanPage() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const currentYear = new Date().getUTCFullYear();
  const [year, setYear] = useState(currentYear);
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
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
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
