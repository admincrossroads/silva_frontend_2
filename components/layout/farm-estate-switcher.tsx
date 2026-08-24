"use client";

import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveFarmEstate } from "@/hooks/use-active-farm-estate";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import { cn } from "@/lib/utils";

type FarmEstateSwitcherProps = {
  /** Compact control for the mobile scope bar */
  compact?: boolean;
};

export function FarmEstateSwitcher({ compact = false }: FarmEstateSwitcherProps) {
  const { estates, activeFarmEstate, setActiveFarmEstateId, isLoading } = useActiveFarmEstate();
  const { isVendor, t } = useVendorLocale();

  if (isLoading) {
    return (
      <span
        className={cn(
          "text-xs text-muted-foreground",
          !compact && "hidden md:inline",
        )}
      >
        {isVendor ? t("nav.loadingFarmAreas") : "Loading farm areas…"}
      </span>
    );
  }

  if (!estates.length) {
    return (
      <span
        className={cn(
          "max-w-[180px] truncate text-xs text-muted-foreground",
          !compact && "hidden md:inline",
        )}
      >
        {isVendor ? t("nav.noFarmArea") : "No farm area assigned"}
      </span>
    );
  }

  if (estates.length === 1) {
    return (
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground",
          !compact && "hidden md:inline-flex",
        )}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate">{estates[0].name}</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        !compact && "hidden md:flex",
      )}
    >
      {!compact ? (
        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-3 w-3 text-primary" />
          {isVendor ? t("nav.farmArea") : "Farm area"}
        </span>
      ) : (
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      )}
      <Select value={activeFarmEstate?.id} onValueChange={setActiveFarmEstateId}>
        <SelectTrigger
          className={cn(
            "h-8 min-w-0 text-xs [&>span]:truncate",
            compact ? "w-[min(11rem,42vw)]" : "w-[160px]",
          )}
          aria-label={isVendor ? t("nav.farmArea") : "Farm area"}
        >
          <SelectValue placeholder="Select farm area" />
        </SelectTrigger>
        <SelectContent>
          {estates.map((estate) => (
            <SelectItem key={estate.id} value={estate.id}>
              {estate.name}
              {estate.location ? ` · ${estate.location}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
