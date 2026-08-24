"use client";

import { MapPin } from "lucide-react";
import { useActiveFarmEstate } from "@/hooks/use-active-farm-estate";

export function FarmAreaScopeBanner() {
  const { activeFarmEstate, estates, isLoading } = useActiveFarmEstate();

  if (isLoading || !activeFarmEstate || estates.length <= 1) return null;

  return (
    <p className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span>
        Showing data for <span className="font-medium text-foreground">{activeFarmEstate.name}</span>
        {activeFarmEstate.location ? ` · ${activeFarmEstate.location}` : ""}
      </span>
    </p>
  );
}
