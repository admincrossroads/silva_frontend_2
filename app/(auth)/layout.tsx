import { Coffee } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[hsl(165_32%_10%)] text-[hsl(150_20%_94%)] p-10 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 20% 20%, hsl(152 45% 28% / 0.55), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, hsl(4 55% 35% / 0.18), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 80L80 0M40 80L80 40M0 40L40 0' stroke='%23ffffff' stroke-width='0.6' fill='none'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/25 ring-1 ring-primary/40">
              <Coffee className="h-5 w-5 text-[hsl(152_70%_72%)]" />
            </div>
            <div>
              <p className="font-display text-2xl tracking-tight text-white">Coffee Field OS</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Multi-tenant field OS</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-5">
          <h1 className="font-display text-4xl xl:text-5xl leading-[1.1] text-white text-balance">
            Field operations, governed cleanly.
          </h1>
          <p className="text-sm leading-relaxed text-white/65 max-w-sm">
            Silva governs. SPX manages. B-Agro executes. One instrument chain from AFP to settlement — with firewalls
            that keep revenue and GL off the wrong desks.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">Org tenants · Shared programs · Role firewalls</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] animate-fade-in">{children}</div>
      </section>
    </div>
  );
}
