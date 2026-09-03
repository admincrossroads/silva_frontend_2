"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";

/** Classic Field OS AFP detail — redirected to Block AFP annual plan. */
export default function LegacyAfpDetailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/planning/afp");
  }, [router]);

  return <PageShell>Redirecting to Annual plan…</PageShell>;
}
