"use client";

import { useMemo } from "react";
import type { NavItem } from "@/lib/config/role-access";
import { translateNavLabel } from "@/lib/i18n/vendor-messages";
import type { VendorLocale } from "@/stores/locale-store";

export function localizeNavItems(items: NavItem[], locale: VendorLocale, enabled: boolean): NavItem[] {
  if (!enabled || locale === "en") return items;

  return items.map((item) => ({
    ...item,
    label: translateNavLabel(item.label, locale),
    children: item.children?.map((child) => ({
      ...child,
      label: translateNavLabel(child.label, locale),
    })),
  }));
}

export function useLocalizedNavItems(items: NavItem[], locale: VendorLocale, enabled: boolean) {
  return useMemo(() => localizeNavItems(items, locale, enabled), [items, locale, enabled]);
}
