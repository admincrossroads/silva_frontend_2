import Link from "next/link";
import { Building2, Tractor, ArrowRight } from "lucide-react";
import { RegistrationHeader } from "@/components/auth/registration-shell";

export default function RegisterPage() {
  return (
    <>
      <RegistrationHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Step 1 of 1 · Choose path</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Apply for platform access</h1>
          <p className="mt-4 text-base leading-relaxed text-[hsl(160_12%_38%)]">
            Select your organization type to begin a guided registration. Applications are reviewed and approved
            workspaces are activated.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Link
            href="/register/asset-owner"
            className="group flex min-h-[220px] flex-col rounded-2xl border border-[hsl(150_14%_86%)] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(20,50,40,0.35)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_50px_-24px_rgba(20,50,40,0.4)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-2xl">Asset owner</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(160_12%_40%)]">
              Estate or landholding company govern plans, approve spend bands, and view released performance.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Start 4-step application
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/register/vendor"
            className="group flex min-h-[220px] flex-col rounded-2xl border border-[hsl(150_14%_86%)] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(20,50,40,0.35)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_50px_-24px_rgba(20,50,40,0.4)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Tractor className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-2xl">Execution vendor</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(160_12%_40%)]">
              Field execution partner work orders, field tickets, and payment requests against SPX authorizations.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Start 4-step application
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </main>
    </>
  );
}
