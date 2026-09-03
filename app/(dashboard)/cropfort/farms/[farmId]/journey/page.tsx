"use client";

import { useParams } from "next/navigation";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { FarmJourneyShell } from "@/components/cropfort/farm-journey-shell";
import { useFarmEstates } from "@/hooks/use-farm-estates";

export default function CropfortFarmJourneyPage() {
  const params = useParams();
  const farmId = String(params.farmId || "");
  const { data: estates = [] } = useFarmEstates({ status: "active" });
  const farm = estates.find((e) => e.id === farmId);

  return (
    <PageShell>
      <PageHeader
        title={farm?.name ? `${farm.name} — Field OS Journey` : "Cropfort Farm Journey"}
        description="Progressive setup: complete each stage to unlock the next."
      />
      <PageContent>
        <FarmJourneyShell farmId={farmId} farmName={farm?.name} />
      </PageContent>
    </PageShell>
  );
}
