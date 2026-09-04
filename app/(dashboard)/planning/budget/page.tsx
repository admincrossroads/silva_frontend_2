"use client";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { FarmBudgetPanel } from "@/components/cropfort/budget/FarmBudgetPanel";
import { useRole } from "@/hooks/use-role";

export default function PlanningBudgetPage() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const allowed = isSilva || isSpx || isSystemAdmin;

  if (!allowed) {
    return (
      <PageShell>
        <PageHeader title="Budget" />
        <p className="text-sm text-muted-foreground">You do not have access.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Budget"
        description="Farm opex (labor, material, service) and commercial fees computed live from rates, plans, and the fee schedule."
      />
      <FarmBudgetPanel />
    </PageShell>
  );
}
