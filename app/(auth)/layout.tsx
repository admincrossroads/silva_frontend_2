import Link from "next/link";
import { Coffee } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel — desktop */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[hsl(165_32%_10%)] p-10 text-[hsl(150_20%_94%)] xl:p-14 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 20% 20%, hsl(152 45% 28% / 0.55), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, hsl(4 55% 35% / 0.18), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 80L80 0M40 80L80 40M0 40L40 0' stroke='%23ffffff' stroke-width='0.6' fill='none'/%3E%3C/svg%3E\")",
          }}
        />

        <Link href="/" className="relative z-10 flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/25 ring-1 ring-primary/40">
            <Coffee className="h-5 w-5 text-[hsl(152_70%_72%)]" />
          </div>
          <div>
            <p className="font-display text-2xl tracking-tight text-white">Coffee Field OS</p>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Multi-tenant field OS</p>
          </div>
        </Link>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[hsl(152_50%_65%)]">The instrument chain</p>
            <h1 className="font-display text-4xl leading-[1.1] text-white text-balance xl:text-5xl">
              Plan → Authorize → Execute → Settle
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/65">
            Asset owners govern. Program managers operate. Vendors execute. One workspace from AFP to settlement
            with role firewalls built in.
          </p>
          <ol className="grid grid-cols-3 gap-2 text-center text-[10px] font-medium uppercase tracking-wider text-white/50">
            {["AFP", "AFE", "WO", "FT", "PR", "STL"].map((step) => (
              <li key={step} className="rounded-lg border border-white/10 bg-white/5 py-2 font-mono text-[hsl(152_50%_68%)]">
                {step}
              </li>
            ))}
          </ol> 
        </div>

        <p className="relative z-10 text-xs text-white/40">Coffee Field OS</p>
      </section>

      {/* Form panel */}
      <section className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center p-5 sm:p-8 lg:p-10">{children}</div>
      </section>
    </div>
  );
}
