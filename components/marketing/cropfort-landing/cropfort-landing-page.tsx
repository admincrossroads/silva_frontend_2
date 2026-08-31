"use client";

import { ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { CropfortNav } from "@/components/marketing/cropfort-landing/cropfort-nav";
import { CropfortFooter } from "@/components/marketing/cropfort-landing/cropfort-footer";
import { CropfortHeroCarousel } from "@/components/marketing/cropfort-landing/cropfort-hero-carousel";
import { MetricsCounterSection } from "@/components/marketing/cropfort-landing/metrics-counter-section";
import { PlatformSection } from "@/components/marketing/cropfort-landing/platform-section";
import { WorkflowSection } from "@/components/marketing/cropfort-landing/workflow-section";
import { cf } from "@/lib/config/cropfort-brand";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: cf.green }}>
      {children}
    </p>
  );
}

type Props = { signedIn: boolean };

export function CropfortLandingPage({ signedIn }: Props) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: cf.bg, color: cf.text }}>
      <CropfortNav signedIn={signedIn} />

      <section className="relative min-h-[100svh] overflow-hidden bg-[#12372A]">
        <CropfortHeroCarousel />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(18,55,42,0.82) 0%, rgba(18,55,42,0.58) 38%, rgba(18,55,42,0.22) 62%, rgba(18,55,42,0.06) 82%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(18,55,42,0.45) 0%, transparent 42%)",
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-3xl bg-gradient-to-r from-[#12372A]/55 via-[#12372A]/20 to-transparent md:max-w-4xl" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-16 pt-28 md:px-8">
          <p
            className="hero-stagger-item text-[11px] font-semibold uppercase tracking-[0.22em] text-[#84A95C]"
            style={{ animationDelay: "0.15s" }}
          >
            THE OPERATING SYSTEM FOR MODERN FARMS
          </p>
          <h1
            className="hero-stagger-item mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.28s" }}
          >
            Run every field operation with confidence.
          </h1>
          <p
            className="hero-stagger-item mt-6 max-w-xl text-base leading-relaxed text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.3)] md:text-lg"
            style={{ animationDelay: "0.42s" }}
          >
            Plan in ETB, authorize commitments, execute in the field, and report with a full audit trail.
          </p>
          <div
            className="hero-stagger-item mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.55s" }}
          >
            <a
              href="#workflow"
              className="inline-flex h-12 items-center justify-center gap-1 rounded-lg border border-white/25 px-6 text-sm font-medium text-white transition hover:bg-white/10"
            >
              See the workflow
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center gap-1 rounded-lg bg-white/10 px-6 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Contact
            </a>
          </div>
        </div>
      </section>

      <MetricsCounterSection />
      <PlatformSection />
      <WorkflowSection />

      <section id="contact" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: cf.white }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 md:px-8">
          <div>
            <SectionLabel>Contact</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight">Talk to our team</h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: cf.muted }}>
              Request a demo or ask about deploying CropFort across your agricultural program.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <CropfortFooter signedIn={signedIn} />
    </div>
  );
}
