"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Layers,
  Palette,
  Shield,
  Sprout,
} from "lucide-react";
import { authApi, programApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { WorkspaceLoader } from "@/components/layout/workspace-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const INTRO_SLIDES = [
  {
    id: "welcome",
    icon: Sprout,
    title: "Welcome to your workspace",
    subtitle: "Coffee Field OS connects planning, approvals, field execution, and payment settlement.",
    bullets: [
      "Silva governs — approves annual plans and large spend",
      "SPX manages — validates field work and releases reports",
      "Vendors execute — submit field evidence and requests for payment",
    ],
  },
  {
    id: "roles",
    icon: Shield,
    title: "Three desks, clear boundaries",
    subtitle: "Each desk has a defined responsibility (and visibility limits).",
    bullets: [
      "No vendor → Silva raw channel",
      "SPX validates before anything is paid",
      "Silva sees settlements and released outcomes, not vendor inboxes",
    ],
  },
  {
    id: "chain",
    icon: Layers,
    title: "One path from plan to payment",
    subtitle: "Everything follows one auditable instrument chain.",
    bullets: [
      "Work plan → AFP → AFE → Work Order",
      "Work Order → Field Ticket → Payment Request",
      "Payment Request → Owner Settlement",
    ],
  },
  {
    id: "start",
    icon: Building2,
    title: "Ready to start the project",
    subtitle: "Next you’ll create a program, then set your tenant branding.",
    bullets: [
      "Program groups your farm estates and execution partners",
      "Branding affects labels and workspace display names",
      "You can change these later in Settings",
    ],
  },
] as const;

const SETUP_LABELS = ["Walkthrough", "Program", "Branding"] as const;
const WIZARD_STEPS = [
  { title: "Walkthrough", description: "A short product tour before you start configuring." },
  { title: "Program", description: "Create a Program so SPX can map execution partners to farm estates." },
  { title: "Branding", description: "Set your display name and a short tagline for your workspace." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { tenant, refreshSession, isAuthenticated, loading } = useAuth();
  const setSession = useAuthStore((s) => s.setSession);
  const [phase, setPhase] = useState<"intro" | "setup">("intro");
  const [introStep, setIntroStep] = useState(0);
  const [setupStep, setSetupStep] = useState(1);
  const [programName, setProgramName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (tenant?.displayName && !displayName) {
      setDisplayName(tenant.displayName);
    }
  }, [tenant?.displayName, displayName]);

  if (loading || !isAuthenticated) {
    return (
      <WorkspaceLoader
        label={loading ? "Loading workspace…" : "Redirecting to sign in…"}
      />
    );
  }

  const progressIndex = phase === "intro" ? 0 : setupStep;
  const slide = INTRO_SLIDES[introStep];
  const SlideIcon = slide.icon;
  const wizardStepIndex = phase === "intro" ? 0 : setupStep; // 0..2

  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      await authApi.updateTenantBranding({
        displayName: displayName || tenant?.displayName,
        branding: { tagline },
      });
      await refreshSession();
      router.push("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save branding"));
    } finally {
      setBusy(false);
    }
  };

  const createProgram = async () => {
    setBusy(true);
    setError("");
    try {
      await programApi.create({ name: programName });
      const me = await authApi.me();
      setSession(me.user, me.permissions, {
        tenant: me.tenant,
        activeProgram: me.activeProgram,
        programs: me.programs,
      });
      setSetupStep(2);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create program"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.52fr)]">
        <div className="min-w-0 space-y-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              Getting started
            </p>
            <h1 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
              {tenant?.displayName ? `Welcome, ${tenant.displayName}` : "Welcome"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {phase === "intro"
                ? `Project walkthrough · ${introStep + 1} of ${INTRO_SLIDES.length}`
                : `Set up your project · step ${setupStep} of 2`}
            </p>
          </div>

          <div className="flex gap-1.5">
            {SETUP_LABELS.map((label, index) => (
              <div key={label} className="flex-1 space-y-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    index <= progressIndex ? "bg-primary" : "bg-muted",
                  )}
                />
                <p className="hidden text-[10px] uppercase tracking-wide text-muted-foreground sm:block">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {phase === "intro" && (
            <div
              key={slide.id}
              className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm animate-[landing-rise_0.4s_ease-out] sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <SlideIcon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl tracking-tight">{slide.title}</h2>

              {introStep === INTRO_SLIDES.length - 1 && (
                <ul className="mt-5 space-y-2 text-sm">
                  {[
                    { icon: Layers, text: "Create a program" },
                    { icon: Shield, text: "SPX connects execution partners" },
                    { icon: Palette, text: "Set branding" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={introStep === 0}
                  onClick={() => setIntroStep((s) => Math.max(0, s - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setPhase("setup");
                      setSetupStep(1);
                    }}
                  >
                    Skip walkthrough
                  </Button>

                  {introStep < INTRO_SLIDES.length - 1 ? (
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        setIntroStep((s) =>
                          Math.min(INTRO_SLIDES.length - 1, s + 1),
                        )
                      }
                    >
                      Next
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setPhase("setup");
                        setSetupStep(1);
                      }}
                    >
                      Start project setup
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {phase === "setup" && setupStep === 1 && (
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm sm:p-6">
              <h2 className="font-display text-xl">Create a program</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A Program is the shared workspace that groups your farm estates and the execution partners SPX will coordinate.
              </p>

              <div className="mt-4 rounded-xl border border-border/70 bg-background/30 p-4">
                <p className="text-sm font-medium">What you need to enter</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>- A name that you’ll recognize later (e.g. "Shecha Estate").</li>
                  <li>- SPX uses this to map vendors to your farm areas.</li>
                </ul>
              </div>

              <div className="mt-5 space-y-4">
                <Input
                  id="programName"
                  label="Program name"
                  placeholder="e.g. Shecha Estate"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setPhase("intro")}>
                    Back to walkthrough
                  </Button>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setSetupStep(2)}>
                      Skip
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={!programName.trim() || busy}
                      onClick={createProgram}
                    >
                      Create & continue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === "setup" && setupStep === 2 && (
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm sm:p-6">
              <h2 className="font-display text-xl">Tenant branding</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This is how your workspace will appear across dashboards (display name + tagline).
              </p>

              <div className="mt-4 rounded-xl border border-border/70 bg-background/30 p-4">
                <p className="text-sm font-medium">Tip</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can change branding later under <span className="font-mono">Settings → Organization</span>.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <Input
                  id="displayName"
                  label="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <Input
                  id="tagline"
                  label="Tagline"
                  placeholder="Short line under your name"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setSetupStep(1)}>
                    Back
                  </Button>
                  <Button className="w-full sm:w-auto" disabled={busy} onClick={finish}>
                    Go to dashboard
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden min-w-0 lg:block">
          <div className="rounded-2xl border border-border/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              At a glance
            </p>
            <h3 className="mt-2 font-display text-lg tracking-tight">Your setup checklist</h3>

            <ol className="mt-4 space-y-3">
              {WIZARD_STEPS.map((s, idx) => {
                const state =
                  idx < wizardStepIndex ? "done" : idx === wizardStepIndex ? "active" : "todo";
                return (
                  <li
                    key={s.title}
                    className={[
                      "rounded-xl border p-3",
                      state === "done"
                        ? "border-primary/30 bg-primary/5"
                        : state === "active"
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/70 bg-background/20 text-muted-foreground",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="mt-1 text-sm leading-relaxed">{s.description}</p>
                      </div>
                      <div
                        className={[
                          "mt-0.5 h-2 w-2 flex-none rounded-full",
                          state === "done"
                            ? "bg-primary"
                            : state === "active"
                              ? "bg-primary"
                              : "bg-muted-foreground/40",
                        ].join(" ")}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 rounded-xl bg-background/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Why this matters</p>
              <p className="mt-2 leading-relaxed">
                The platform uses your Program and branding to keep approvals, vendor evidence, and payment settlement auditable—without mixing
                raw field data between desks.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

