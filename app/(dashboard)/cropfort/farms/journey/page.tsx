"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import type { FarmEstate } from "@/lib/api/farm-estates";

function pickDefaultFarm(estates: FarmEstate[]): FarmEstate | null {
  if (!estates.length) return null;
  const active = estates.filter((e) => e.status === "active");
  const pool = active.length ? active : estates;
  return pool.find((e) => /chaka\s*buna/i.test(e.name)) ?? pool[0];
}

export default function CropfortFarmJourneyIndexPage() {
  const router = useRouter();
  const { data: estates = [], isLoading, isError, error, refetch } = useFarmEstates({
    status: "active",
  });
  const target = useMemo(() => pickDefaultFarm(estates), [estates]);

  useEffect(() => {
    if (target) router.replace(`/cropfort/farms/${target.id}/journey`);
  }, [target, router]);

  const message =
    (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
      ?.message ||
    (error as { message?: string })?.message ||
    "Could not load farms.";

  return (
    <PageShell>
      <PageHeader
        title="Cropfort Farm Journey"
        description="Select a farm to continue progressive Field OS setup."
      />
      <PageContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Finding your farm…</p>
        ) : isError ? (
          <div className="space-y-3 text-sm">
            <p className="text-destructive">{message}</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !estates.length ? (
          <p className="text-sm text-muted-foreground">
            No farms are available for your role yet. Ask SPX to add a farm estate under Settings →
            Farm estates.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Opening farm journey…</p>
            <ul className="flex flex-wrap gap-2">
              {estates.map((e) => (
                <li key={e.id}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/cropfort/farms/${e.id}/journey`)}
                  >
                    {e.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageContent>
    </PageShell>
  );
}
