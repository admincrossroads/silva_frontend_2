"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RegistrationHeader } from "@/components/auth/registration-shell";

export default function RegisterSubmittedPage() {
  const params = useSearchParams();
  const type = params.get("type");

  return (
    <>
      <RegistrationHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-3xl text-primary">✓</div>
        <h1 className="mt-8 font-display text-4xl tracking-tight">Application received</h1>
        <p className="mt-4 text-base leading-relaxed text-[hsl(160_12%_38%)]">
          Your {type === "vendor" ? "vendor" : "asset owner"} registration is with SPX for review. You will be
          contacted before your workspace is activated.
        </p>
        <div className="mt-8 w-full rounded-2xl border border-[hsl(150_14%_86%)] bg-white p-6 text-left text-sm leading-relaxed text-muted-foreground">
          After approval, SPX sends an activation link to set your password and sign in. SPX then maps your
          organization to programs, farm estates, and partner vendors as needed.
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
    </>
  );
}
