"use client";

import { MapPin, ExternalLink } from "lucide-react";
import type { FarmEstate } from "@/lib/api/farm-estates";
import {
  openStreetMapEmbedUrl,
  openStreetMapLink,
  parseEstateCoordinates,
} from "@/lib/farm/estate-map";
import { cn } from "@/lib/utils";

type FarmEstateMapProps = {
  estate: FarmEstate | null;
  loading?: boolean;
  className?: string;
  heightClassName?: string;
};

export function FarmEstateMap({
  estate,
  loading,
  className,
  heightClassName = "h-[280px]",
}: FarmEstateMapProps) {
  if (loading) {
    return <div className={cn("animate-pulse rounded-lg bg-muted/50", heightClassName, className)} />;
  }

  if (!estate) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 text-center",
          heightClassName,
          className,
        )}
      >
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No farm estate selected for this program.</p>
      </div>
    );
  }

  const point = parseEstateCoordinates(estate.location, estate.name);
  if (!point) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 text-center",
          heightClassName,
          className,
        )}
      >
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Add a location on the farm estate to show it on the map.
        </p>
      </div>
    );
  }

  const area =
    estate.totalAreaHa != null && !Number.isNaN(Number(estate.totalAreaHa))
      ? `${Number(estate.totalAreaHa).toLocaleString()} ha`
      : null;
  const blockCount = estate.blocks?.length ?? 0;

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{estate.name}</p>
          <p className="text-xs text-muted-foreground">
            {[estate.location, area, blockCount ? `${blockCount} blocks` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <a
          href={openStreetMapLink(point)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Open map
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <iframe
        title={`Map of ${estate.name}`}
        src={openStreetMapEmbedUrl(point)}
        className={cn("w-full border-0", heightClassName)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
