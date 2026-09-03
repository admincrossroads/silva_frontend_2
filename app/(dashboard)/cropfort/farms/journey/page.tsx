"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const sorted = useMemo(
    () => [...estates].sort((a, b) => a.name.localeCompare(b.name)),
    [estates],
  );
  const preferred = useMemo(() => pickDefaultFarm(estates), [estates]);

  const message =
    (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
      ?.message ||
    (error as { message?: string })?.message ||
    "Could not load farms.";

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">Farm journey</h1>
        {preferred ? (
          <Button size="sm" onClick={() => router.push(`/cropfort/farms/${preferred.id}/journey`)}>
            Open {preferred.name}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="space-y-3 text-sm">
          <p className="text-destructive">{message}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !sorted.length ? (
        <p className="text-sm text-muted-foreground">No farms available.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((e) => (
            <Card
              key={e.id}
              className="cursor-pointer p-4 transition-colors hover:bg-muted/40"
              onClick={() => router.push(`/cropfort/farms/${e.id}/journey`)}
            >
              <p className="font-medium">{e.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.location || "—"} · {e.blocks?.length ?? 0} blocks
                {e.ownerOrganizationId ? "" : " · no owner"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
