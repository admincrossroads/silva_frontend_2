import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VendorLocale = "en" | "am";

type LocaleState = {
  locale: VendorLocale;
  setLocale: (locale: VendorLocale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "coffee-field-os-locale" },
  ),
);
