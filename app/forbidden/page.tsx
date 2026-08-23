"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ForbiddenContent() {
  const params = useSearchParams();
  const reason = params.get("reason") || "You do not have access to this area.";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Access restricted</h1>
      <p className="max-w-md text-center text-muted-foreground">{reason}</p>
      <Link href="/dashboard" className="text-primary underline">
        Back to dashboard
      </Link>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted-foreground">Loading…</p>}>
      <ForbiddenContent />
    </Suspense>
  );
}
