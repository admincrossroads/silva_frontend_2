"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, Coffee, ShieldCheck, Sprout, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

const CHAIN = [
  { id: "AFP", label: "Plan", detail: "Set the year’s budget and field targets." },
  { id: "AFE", label: "Authorize", detail: "Approve spend by Schedule 3 band." },
  { id: "WO", label: "Assign", detail: "Issue work to the right vendor crew." },
  { id: "FT", label: "Record", detail: "Capture what happened in the field." },
  { id: "PR", label: "Request", detail: "Submit payment against signed work." },
  { id: "STL", label: "Settle", detail: "Authorize and close the payment." },
];

export default function LandingPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signedIn = mounted && Boolean(accessToken);

  return (
    <div className="min-h-screen bg-[hsl(165_28%_8%)] text-[hsl(150_18%_96%)]">
      {/* Sticky friendly header */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-[hsl(165_30%_8%/0.88)] backdrop-blur-xl py-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(152_50%_32%/0.55)] ring-1 ring-[hsl(152_55%_55%/0.4)]">
              <Coffee className="h-4 w-4 text-[hsl(152_70%_78%)]" />
            </span>
            <span className="font-display text-lg tracking-tight text-white sm:text-xl">Coffee Field OS</span>
          </Link>
          <nav className="flex items-center gap-1">
            <a
              href="#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white md:inline-block"
            >
              How it works
            </a>
            <a
              href="#flow"
              className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white lg:inline-block"
            >
              The flow
            </a>
            <a
              href="#trust"
              className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white md:inline-block"
            >
              Trust
            </a>
            {signedIn ? (
              <Button asChild size="sm" className="ml-1 rounded-xl bg-white px-4 text-[hsl(165_32%_12%)] hover:bg-white/90">
                <Link href="/dashboard">Open workspace</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-white/85 hover:bg-white/10 hover:text-white"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl bg-white px-4 text-[hsl(165_32%_12%)] hover:bg-white/90">
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0 scale-105 animate-[landing-drift_36s_ease-in-out_infinite_alternate]"
          style={{
            backgroundImage:
              "linear-gradient(160deg, hsl(165 34% 7% / 0.78) 0%, hsl(165 28% 10% / 0.45) 45%, hsl(155 30% 8% / 0.88) 100%), url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=2400&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(165_30%_7%)] via-transparent to-[hsl(165_30%_7%/0.35)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
          <div className="max-w-xl space-y-6 animate-[landing-rise_0.9s_ease-out] sm:max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(152_55%_72%)]">
              <Sprout className="h-3.5 w-3.5" />
              For coffee estate teams
            </p>
            <h1 className="font-display text-[2.85rem] leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
              Coffee Field OS
            </h1>
            <p className="max-w-md text-base leading-relaxed text-white/78 sm:text-lg">
              Plan the season, authorize spend, and settle work — with owners, managers, and field crews each seeing
              only what they should.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              {signedIn ? (
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-primary px-7 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                  onClick={() => router.push("/dashboard")}
                >
                  Continue to dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl bg-primary px-7 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                  >
                    <Link href="/signup">
                      Create your organization
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-white/35 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                  >
                    <Link href="/login">I already have an account</Link>
                  </Button>
                </>
              )}
            </div>
            {!signedIn && (
              <p className="text-xs text-white/45">
                Try a demo: <span className="text-white/70">principal@spx.example</span> · Password123!
              </p>
            )}
          </div>

          <a
            href="#how-it-works"
            className="mt-14 inline-flex w-fit items-center gap-2 text-sm text-white/55 transition hover:text-white"
          >
            See how it works
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-[hsl(155_18%_97%)] px-5 py-20 text-[hsl(160_28%_14%)] md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Simple setup</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Three desks. One estate.</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(160_12%_38%)]">
            Your organization is private. A Program is the shared estate where partners collaborate — invite Silva, SPX,
            or vendors when you’re ready.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Govern",
                who: "Silva",
                body: "Approve plans and higher-band spend. Read released reports — not raw field tickets.",
              },
              {
                icon: Users,
                title: "Manage",
                who: "SPX",
                body: "Issue authorizations, oversee crews, verify payments, and keep the operating rhythm.",
              },
              {
                icon: Sprout,
                title: "Execute",
                who: "Vendors",
                body: "Capture field work, submit tickets, and request payment against signed-off activity.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-[0_12px_40px_-20px_rgba(20,50,40,0.35)] ring-1 ring-[hsl(150_14%_86%)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(20,50,40,0.4)]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-primary/80">{item.who}</p>
                <h3 className="mt-1 font-display text-2xl text-[hsl(160_28%_14%)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[hsl(160_12%_40%)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="scroll-mt-20 bg-[hsl(165_26%_11%)] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[hsl(152_50%_65%)]">The flow</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-white md:text-4xl">
            From plan to payment — clearly
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55">
            Follow one path your whole team recognizes. No jumping ahead, no mystery steps.
          </p>

          <div className="mt-12 flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6 md:gap-3 md:overflow-visible md:pb-0">
            {CHAIN.map((item, i) => (
              <div
                key={item.id}
                className="relative min-w-[9.5rem] flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-[hsl(152_45%_45%/0.55)] hover:bg-white/[0.07] md:min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[hsl(152_50%_68%)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60">
                    {item.id}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl text-white">{item.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual + trust */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, hsl(165 30% 8% / 0.92) 0%, hsl(165 28% 10% / 0.55) 55%, hsl(165 28% 10% / 0.35) 100%), url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2200&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <div>
            <p className="font-display text-3xl leading-snug text-white md:text-4xl text-balance">
              Built so everyone can move faster — without stepping on each other’s desk.
            </p>
          </div>
          <div id="trust" className="scroll-mt-24 space-y-5 rounded-2xl border border-white/15 bg-[hsl(165_30%_8%/0.55)] p-6 backdrop-blur-md md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[hsl(152_50%_68%)]">Trust built in</p>
            <ul className="space-y-4">
              {[
                "Owners see outcomes and settlements — not raw tickets.",
                "Revenue stays with the SPX principal only.",
                "People can’t approve their own submissions.",
                "Missing insurance blocks work from going live.",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-white/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-xl bg-[hsl(152_55%_58%)]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-[hsl(155_18%_97%)] px-5 py-20 text-[hsl(160_28%_14%)] md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Get started</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Pick your organization type</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(160_12%_38%)]">
            Signup takes a minute. You’ll create an admin account, then invite partners into a Program.
          </p>

          <div className="mt-10 divide-y divide-[hsl(150_14%_86%)] overflow-hidden rounded-2xl bg-white ring-1 ring-[hsl(150_14%_86%)]">
            {[
              {
                type: "Silva",
                role: "Owner",
                copy: "Govern plans, approvals, and released performance.",
                href: "/signup",
              },
              {
                type: "SPX",
                role: "Manager",
                copy: "Run day-to-day operations, reports, and settlements.",
                href: "/signup",
              },
              {
                type: "Vendor",
                role: "Field team",
                copy: "Record work, submit tickets, and request payment.",
                href: "/signup",
              },
            ].map((row) => (
              <Link
                key={row.type}
                href={row.href}
                className="group flex flex-col gap-2 px-5 py-6 transition hover:bg-primary/[0.04] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="font-display text-2xl text-[hsl(160_28%_14%)]">{row.type}</span>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-primary">{row.role}</span>
                  <span className="text-sm text-[hsl(160_12%_40%)]">{row.copy}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition group-hover:opacity-100">
                  Start as {row.type}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-5 py-24 md:px-8 md:py-28">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 120%, hsl(152 48% 28% / 0.55), transparent 60%), hsl(165 28% 8%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight text-white md:text-5xl text-balance">
            Ready when your estate is
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60">
            Create your organization, invite partners, and run the season with clear desks and a shared program.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {signedIn ? (
              <Button asChild size="lg" className="h-12 rounded-xl bg-white px-8 text-[hsl(165_32%_12%)] hover:bg-white/90">
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  <Link href="/signup">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Coffee className="h-4 w-4 text-[hsl(152_60%_65%)]" />
            <span className="font-display text-base text-white/80">Coffee Field OS</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/45">
            <a href="#how-it-works" className="transition hover:text-white/80">
              How it works
            </a>
            <a href="#flow" className="transition hover:text-white/80">
              The flow
            </a>
            <a href="#trust" className="transition hover:text-white/80">
              Trust
            </a>
            <Link href="/login" className="transition hover:text-white/80">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
