"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cfos-cookie-consent";

type Consent = "accepted" | "essential" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent;
      if (stored === "accepted" || stored === "essential") setConsent(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = (value: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
  };

  if (!ready || consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] p-4 sm:p-5 sm:pr-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-[hsl(150_14%_84%)] bg-white p-4 shadow-[0_16px_48px_-18px_rgba(10,40,30,0.4)] sm:flex-row sm:items-center sm:p-5">
        <div className="flex flex-1 gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie className="h-4 w-4" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[hsl(160_28%_14%)]">We use cookies</p>
            <p className="text-xs leading-relaxed text-[hsl(160_12%_40%)] sm:text-sm">
              Essential cookies keep you signed in. Optional cookies help us improve the site. See our{" "}
              <Link href="/#contact" className="font-medium text-primary hover:underline">
                contact
              </Link>{" "}
              section with any privacy questions.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => save("essential")}
          >
            Essential only
          </Button>
          <Button type="button" size="sm" className="rounded-xl" onClick={() => save("accepted")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
