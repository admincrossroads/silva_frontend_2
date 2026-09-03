"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { CoreOperationsView } from "@/components/operations/core-operations-view";

type Props = {
  coreView: "intervention" | "project";
};

function OperationsHubContent({ coreView }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  useEffect(() => {
    if (tab === "rate-card") router.replace("/planning/rate-card");
    else if (tab === "block-afp") router.replace("/planning/afp");
    else if (tab === "weekly-entry") router.replace("/execution/field-tickets");
    else if (tab === "projects") router.replace("/operations/projects");
    else if (tab === "interventions") router.replace("/operations/interventions");
  }, [tab, router]);

  if (tab === "rate-card" || tab === "block-afp" || tab === "weekly-entry") {
    return <PageShell>Redirecting…</PageShell>;
  }

  return (
    <PageShell>
      <CoreOperationsView view={coreView} embedded />
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
