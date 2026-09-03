"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { FarmJourneyShell } from "@/components/cropfort/farm-journey-shell";
import { useFarmEstates } from "@/hooks/use-farm-estates";

export default function CropfortFarmJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = String(params.farmId || "");
  const { data: estates = [] } = useFarmEstates({ status: "active" });
  const farm = estates.find((e) => e.id === farmId);
  const sorted = [...estates].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">{farm?.name || "Farm journey"}</h1>
        {sorted.length > 1 ? (
          <Select
            id="farm-switcher"
            label="Farm"
            value={farmId}
            onChange={(e) => router.push(`/cropfort/farms/${e.target.value}/journey`)}
            className="w-56"
          >
            {sorted.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
      <FarmJourneyShell farmId={farmId} farmName={farm?.name} />
    </PageShell>
  );
}
