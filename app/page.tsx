"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, Coffee, ShieldCheck, Sprout, Users } from "lucide-react";
import { SiteHeader, useLandingScroll } from "@/components/marketing/site-header";
import { HeroBackground } from "@/components/marketing/hero-background";
import { ParallaxSection } from "@/components/marketing/parallax-section";
import { ContactForm } from "@/components/marketing/contact-form";
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
  const scrolled = useLandingScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  const signedIn = mounted && Boolean(accessToken);

  return (
    <div className="min-h-screen bg-[hsl(165_28%_8%)] text-[hsl(150_18%_96%)]">
      <SiteHeader signedIn={signedIn} scrolled={scrolled} />

      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <HeroBackground />
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
              Plan the season, authorize spend, and settle work with owners, managers, and field crews each seeing
              only what they should.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              {signedIn ? (
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-primary px-7 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                  onClick={() => router.push("/dashboard")}
                >
                  Open workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl bg-primary px-7 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                  >
                    <Link href="/login">
                      Sign in to workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-white/35 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                  >
                    <Link href="/register">Apply for access</Link>
                  </Button>
                </>
              )}
            </div>
            {!signedIn && (
              <p className="text-xs text-white/45">
                Demo on sign in: <span className="text-white/70">principal@spx.example</span> · Password123!
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

          {!signedIn && (
            <div id="journey" className="mt-10 flex max-w-lg flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/55 backdrop-blur-sm sm:gap-3 sm:text-sm">
              <span className="font-medium text-white/80">Your path</span>
              <span className="hidden text-white/30 sm:inline">·</span>
              <span>Home</span>
              <ArrowRight className="h-3 w-3 text-white/35" />
              <Link href="/login" className="font-medium text-[hsl(152_60%_72%)] hover:text-white">
                Sign in
              </Link>
              <ArrowRight className="h-3 w-3 text-white/35" />
              <span className="text-white/70">Dashboard</span>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-[hsl(155_18%_97%)] px-5 py-20 text-[hsl(160_28%_14%)] md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Simple setup</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Three desks. One estate.</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(160_12%_38%)]">
            SPX operates the platform. Asset owners and vendors apply for access; SPX reviews each application,
            activates approved workspaces, and maps partners to shared programs.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Govern",
                who: "Asset owners",
                body: "Approve plans and higher-band spend. Read released reports — not raw field tickets.",
              },
              {
                icon: Users,
                title: "Manage",
                who: "Program managers",
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
            From plan to payment clearly
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
      <ParallaxSection
        imageUrl="https://images.unsplash.com/photo-1653007574493-edad758220d8?auto=format&fit=crop&w=2200&q=80"
        gradient="linear-gradient(90deg, hsl(165 30% 8% / 0.92) 0%, hsl(165 28% 10% / 0.55) 55%, hsl(165 28% 10% / 0.35) 100%)"
        backgroundPosition="center 40%"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <div>
            <p className="font-display text-3xl leading-snug text-white md:text-4xl text-balance">
              Built so everyone can move faster without stepping on each other’s desk.
            </p>
          </div>
          <div id="trust" className="scroll-mt-24 space-y-5 rounded-2xl border border-white/15 bg-[hsl(165_30%_8%/0.55)] p-6 backdrop-blur-md md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[hsl(152_50%_68%)]">Trust built in</p>
            <ul className="space-y-4">
              {[
                "Owners see outcomes and settlements not raw tickets.",
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
      </ParallaxSection>

      {/* Who it's for */}
      <section className="bg-[hsl(155_18%_97%)] px-5 py-20 text-[hsl(160_28%_14%)] md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Get started</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Pick your organization type</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(160_12%_38%)]">
            Apply as an asset owner or execution vendor. SPX reviews your profile, contacts you, then activates your workspace.
          </p>

          <div className="mt-10 divide-y divide-[hsl(150_14%_86%)] overflow-hidden rounded-2xl bg-white ring-1 ring-[hsl(150_14%_86%)]">
            {[
              {
                type: "Asset owner",
                role: "Governance desk",
                copy: "Approve plans, higher-band spend, and released performance reports.",
                href: "/register/asset-owner",
              },
              {
                type: "Execution vendor",
                role: "Field partner",
                copy: "Record work, submit tickets, and request payment.",
                href: "/register/vendor",
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
                  Start application
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-[hsl(160_12%_40%)]">
            SPX platform staff sign in with administrator accounts there is no public SPX registration.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 bg-[hsl(155_18%_97%)] px-5 py-20 text-[hsl(160_28%_14%)] md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Contact</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Talk to the platform team</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[hsl(160_12%_38%)]">
              Questions about onboarding, partnerships, or how Coffee Field OS fits your estate? Send a message and
              SPX will follow up by email.
            </p>
            <p className="mt-6 text-sm text-[hsl(160_12%_40%)]">
              Ready to join?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Apply for access
              </Link>{" "}
              instead for a full workspace review.
            </p>
          </div>
          <ContactForm />
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
            Apply as an asset owner or execution vendor. SPX reviews your application and activates your workspace.
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
                  <Link href="/login">
                    Sign in to workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/register">Apply for access</Link>
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
            <a href="#contact" className="transition hover:text-white/80">
              Contact
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
