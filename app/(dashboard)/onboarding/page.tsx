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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const INTRO_SLIDES = [
  {
    id: "welcome",
    icon: Sprout,
    title: "Welcome to your workspace",
  },
  {
    id: "roles",
    icon: Shield,
    title: "Three desks, clear boundaries",
  },
  {
    id: "chain",
    icon: Layers,
    title: "One path from plan to payment",
  },
  {
    id: "start",
    icon: Building2,
    title: "Ready to start the project",
  },
] as const;

const SETUP_LABELS = ["Walkthrough", "Program", "Branding"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { tenant, refreshSession } = useAuth();
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
    if (tenant?.displayName && !displayName) {
      setDisplayName(tenant.displayName);
    }
  }, [tenant?.displayName, displayName]);

  const progressIndex = phase === "intro" ? 0 : setupStep;
  const slide = INTRO_SLIDES[introStep];
  const SlideIcon = slide.icon;

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
    <div className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Getting started</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
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
            <p className="hidden text-[10px] uppercase tracking-wide text-muted-foreground sm:block">{label}</p>
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
          className="rounded-2xl border border-border/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm animate-[landing-rise_0.4s_ease-out]"
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

          <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={introStep === 0}
              onClick={() => setIntroStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
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
                  onClick={() => setIntroStep((s) => Math.min(INTRO_SLIDES.length - 1, s + 1))}
                >
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
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
        <div className="rounded-2xl border border-border/80 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-xl">Create a program</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Name your estate or portfolio program. SPX will map execution vendors to your farm areas after setup.
          </p>
          <div className="mt-5 space-y-4">
            <Input
              id="programName"
              label="Program name"
              placeholder="e.g. Shecha Estate"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setPhase("intro")}>
                Back to walkthrough
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSetupStep(2)}>
                  Skip
                </Button>
                <Button disabled={!programName.trim() || busy} onClick={createProgram}>
                  Create & continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "setup" && setupStep === 2 && (
        <div className="rounded-2xl border border-border/80 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-xl">Tenant branding</h2>
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
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setSetupStep(1)}>
                Back
              </Button>
              <Button disabled={busy} onClick={finish}>
                Go to dashboard
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
