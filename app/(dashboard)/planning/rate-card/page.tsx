"use client";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { RateCardPanel } from "@/components/cropfort/rate-card-panel";
import { useRole } from "@/hooks/use-role";

export default function RateCardPage() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const allowed = isSilva || isSpx || isSystemAdmin;

  if (!allowed) {
    return (
      <PageShell>
        <PageHeader title="Rate card" />
        <p className="text-sm text-muted-foreground">You do not have access.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader title="Rate card" />
      <RateCardPanel />
    </PageShell>
  );
}
