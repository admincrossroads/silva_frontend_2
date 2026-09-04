"use client";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { FieldWorkCalendarPanel } from "@/components/cropfort/field-work-calendar/FieldWorkCalendarPanel";
import { useRole } from "@/hooks/use-role";

export default function FieldWorkCalendarPage() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const allowed = isSilva || isSpx || isSystemAdmin;

  if (!allowed) {
    return (
      <PageShell>
        <PageHeader title="Field work calendar" />
        <p className="text-sm text-muted-foreground">You do not have access.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader title="Field work calendar" />
      <FieldWorkCalendarPanel />
    </PageShell>
  );
}
