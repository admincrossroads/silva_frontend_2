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

export function FarmEstateSwitcher() {
  const { estates, activeFarmEstate, setActiveFarmEstateId, isLoading } = useActiveFarmEstate();
  const { isVendor, t } = useVendorLocale();

  if (isLoading) {
    return (
      <span className="hidden text-xs text-muted-foreground md:inline">
        {isVendor ? t("nav.loadingFarmAreas") : "Loading farm areas…"}
      </span>
    );
  }

  if (!estates.length) {
    return (
      <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:inline">
        {isVendor ? t("nav.noFarmArea") : "No farm area assigned"}
      </span>
    );
  }

  if (estates.length === 1) {
    return (
      <span className="hidden items-center gap-1.5 text-xs font-medium text-foreground md:inline-flex">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="max-w-[160px] truncate">{estates[0].name}</span>
      </span>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <MapPin className="h-3 w-3 text-primary" />
        {isVendor ? t("nav.farmArea") : "Farm area"}
      </span>
      <Select value={activeFarmEstate?.id} onValueChange={setActiveFarmEstateId}>
        <SelectTrigger className="h-8 min-w-0 w-[160px] text-xs [&>span]:truncate">
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
