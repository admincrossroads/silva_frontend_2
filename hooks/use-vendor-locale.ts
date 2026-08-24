"use client";

import { useCallback, useEffect } from "react";
import { useRole } from "@/hooks/use-role";
import { useLocaleStore, type VendorLocale } from "@/stores/locale-store";
import {
  vendorT,
  translateNavLabel,
  translateQuickActionLabel,
  type VendorMessageKey,
} from "@/lib/i18n/vendor-messages";
import type { NavItem } from "@/lib/config/role-access";

export function useVendorLocale() {
  const { isVendor } = useRole();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    if (!isVendor) {
      document.documentElement.lang = "en";
      return;
    }
    document.documentElement.lang = locale === "am" ? "am" : "en";
  }, [isVendor, locale]);

  const t = useCallback(
    (key: VendorMessageKey) => {
      if (!isVendor || locale === "en") return vendorT(key, "en");
      return vendorT(key, locale);
    },
    [isVendor, locale],
  );

  const translateNavItems = useCallback(
    (items: NavItem[]): NavItem[] => {
      if (!isVendor || locale === "en") return items;
      return items.map((item) => ({
        ...item,
        label: translateNavLabel(item.label, locale),
        children: item.children?.map((child) => ({
          ...child,
          label: translateNavLabel(child.label, locale),
        })),
      }));
    },
    [isVendor, locale],
  );

  const translateQuickActions = useCallback(
    (labels: string[]) => {
      if (!isVendor || locale === "en") return labels;
      return labels.map((label) => translateQuickActionLabel(label, locale));
    },
    [isVendor, locale],
  );

  return {
    locale,
    setLocale,
    t,
    isVendor,
    isAmharic: locale === "am",
    translateNavItems,
    translateQuickActions,
  };
}

export type { VendorLocale };
