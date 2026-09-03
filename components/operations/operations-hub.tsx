"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { CoreOperationsView } from "@/components/operations/core-operations-view";
import { OperationsTabBar, type TabId } from "@/components/operations/operations-tab-bar";
import { RateCardPanel } from "@/components/cropfort/rate-card-panel";
import { AfpBlocksPanel } from "@/components/cropfort/afp-blocks-panel";
import { WeeklyEntryPanel } from "@/components/cropfort/weekly-entry-panel";

type Props = {
  coreView: "intervention" | "project";
};

function OperationsHubContent({ coreView }: Props) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") as TabId | null;
  const basePath =
    coreView === "project" ? "/operations/projects" : "/operations/interventions";
  const defaultTab: TabId = coreView === "project" ? "projects" : "interventions";
  const active = tab || defaultTab;
  const isCropfort = active === "rate-card" || active === "block-afp" || active === "weekly-entry";

  return (
    <PageShell>
      <OperationsTabBar active={active} basePath={basePath} />
      {active === "rate-card" ? <RateCardPanel /> : null}
      {active === "block-afp" ? <AfpBlocksPanel /> : null}
      {active === "weekly-entry" ? <WeeklyEntryPanel /> : null}
      {!isCropfort ? <CoreOperationsView view={coreView} embedded /> : null}
    </PageShell>
  );
}

export function OperationsHub(props: Props) {
  return (
    <Suspense fallback={<PageShell>Loading…</PageShell>}>
      <OperationsHubContent {...props} />
    </Suspense>
  );
}
