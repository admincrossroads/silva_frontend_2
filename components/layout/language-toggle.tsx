"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVendorLocale } from "@/hooks/use-vendor-locale";
import type { VendorLocale } from "@/stores/locale-store";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { isVendor, locale, setLocale, t } = useVendorLocale();

  if (!isVendor) return null;

  const options: { value: VendorLocale; label: string }[] = [
    { value: "en", label: t("lang.english") },
    { value: "am", label: t("lang.amharic") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          aria-label={t("lang.toggle")}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{locale === "am" ? "አማ" : "EN"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setLocale(option.value)}
            className={cn(locale === option.value && "font-semibold text-primary")}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
