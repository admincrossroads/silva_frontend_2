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
  UserPlus,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { platformApi } from "@/lib/api/platform";
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/use-auth";
import { WorkspaceLoader } from "@/components/layout/workspace-loader";
import { BrandLogo, SpxFarmMark } from "@/components/brand/spx-farm-logo";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { cn } from "@/lib/utils";
import {
  canEditBrandingDuringOnboarding,
  canInviteDuringOnboarding,
} from "@/lib/utils/onboarding";

const INTRO_SLIDES = [
  {
    id: "welcome",
    icon: SpxFarmMark,
    title: "Welcome to your workspace",
    subtitle: `${siteConfig.name} connects planning, approvals, field execution, and payment settlement.`,
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
    subtitle: "Every field activity follows the same auditable chain — no side doors.",
    bullets: [
      "Annual work plan → AFP → AFE → Work Order (what was approved and issued)",
      "Work Order → Field Ticket → Payment Request (what happened in the field)",
      "Payment Request → Owner Settlement (what Silva pays after SPX validation)",
    ],
  },
  {
    id: "start",
    icon: Building2,
    title: "Ready to start the project",
    subtitle: "A short setup: invite your team (optional), then open your dashboard.",
    bullets: [
      "Invite field leads and workers so they can capture tickets and evidence",
      "SPX connects your vendor org to farm estates — no program setup on your side",
      "Set a display name and tagline, or change them later under Settings",
    ],
  },
];

type TeamInviteRow = { email: string; role: string };

export default function OnboardingPage() {
  const router = useRouter();
  const { tenant, user, refreshSession, isAuthenticated, loading } = useAuth();
  const canInvite = canInviteDuringOnboarding(user?.role);
  const canEditBranding = canEditBrandingDuringOnboarding(user?.role);
  const setupStepCount = canInvite ? 2 : 1;
  const brandingStep = canInvite ? 2 : 1;

  const [phase, setPhase] = useState<"intro" | "setup">("intro");
  const [introStep, setIntroStep] = useState(0);
  const [setupStep, setSetupStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [teamInvites, setTeamInvites] = useState<TeamInviteRow[]>([
    { email: "", role: "vendor_field_lead" },
  ]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const setupLabels = canInvite
    ? (["Walkthrough", "Team", "Branding"] as const)
    : (["Walkthrough", "Branding"] as const);

  const wizardSteps = canInvite
    ? [
        { title: "Walkthrough", description: "A short product tour before you start configuring." },
        { title: "Team", description: "Invite field leads, supervisors, and workers to your organization." },
        { title: "Branding", description: "Set your display name and a short tagline for your workspace." },
      ]
    : [
        { title: "Walkthrough", description: "A short product tour before you start configuring." },
        { title: "Branding", description: "Set your display name and a short tagline for your workspace." },
      ];

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
  const wizardStepIndex = phase === "intro" ? 0 : setupStep;
  const organizationId = user?.organizationId || tenant?.id || "";

  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      await authApi.completeOnboarding({
        ...(canEditBranding
          ? {
              displayName: displayName || tenant?.displayName,
              branding: { tagline },
            }
          : { branding: { tagline: tagline || undefined } }),
      });
      await refreshSession();
      toast.success("Workspace ready");
      router.push("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not finish setup"));
      toast.error(err, "Could not finish setup");
    } finally {
      setBusy(false);
    }
  };

  const sendTeamInvites = async () => {
    if (!organizationId) {
      setError("Missing organization context. Sign out and sign in again.");
      return;
    }
    const pending = teamInvites.filter((row) => row.email.trim());
    if (pending.length === 0) {
      setSetupStep(brandingStep);
      return;
    }

    setBusy(true);
    setError("");
    try {
      for (const row of pending) {
        await platformApi.createOrganizationInvite(organizationId, {
          email: row.email.trim(),
          role: row.role,
        });
      }
      toast.success(pending.length === 1 ? "Invite sent" : `${pending.length} invites sent`);
      setSetupStep(brandingStep);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send invites"));
      toast.error(err, "Could not send invites");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-10 xl:max-w-6xl xl:py-14 2xl:max-w-7xl 2xl:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.52fr)] xl:gap-10">
        <div className="min-w-0 space-y-6">
          <div>
            <BrandLogo size="sm" withWordmark showTagline={false} className="mb-4" />
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              Getting started
            </p>
            <h1 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
              {tenant?.displayName ? `Welcome, ${tenant.displayName}` : "Welcome"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {phase === "intro"
                ? `Project walkthrough · ${introStep + 1} of ${INTRO_SLIDES.length}`
                : `Set up your project · step ${setupStep} of ${setupStepCount}`}
            </p>
          </div>

          <div className="flex gap-1.5">
            {setupLabels.map((label, index) => (
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
              <p className="mt-2 text-sm text-muted-foreground">{slide.subtitle}</p>

              <ul className="mt-5 space-y-2.5 text-sm">
                {slide.bullets.map((text) => (
                  <li key={text} className="flex gap-2 leading-relaxed text-foreground/90">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              {introStep === INTRO_SLIDES.length - 1 && (
                <div className="mt-6 rounded-xl border border-border/70 bg-background/30 p-4">
                  <p className="text-sm font-medium">What happens next</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {canInvite ? (
                      <>
                        <li className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-primary" />
                          Invite your team (optional)
                        </li>
                        <li className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-primary" />
                          Set workspace branding
                        </li>
                      </>
                    ) : (
                      <li className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        Confirm branding and open your dashboard
                      </li>
                    )}
                  </ul>
                </div>
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

          {phase === "setup" && canInvite && setupStep === 1 && (
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm sm:p-6">
              <h2 className="font-display text-xl">Invite your team</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add field leads, supervisors, and workers who will execute work orders and submit field evidence.
              </p>

              <div className="mt-5 space-y-3">
                {teamInvites.map((row, index) => (
                  <div key={index} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
                    <Input
                      id={`inviteEmail-${index}`}
                      label={index === 0 ? "Email address" : undefined}
                      type="email"
                      placeholder="user@example.com"
                      value={row.email}
                      onChange={(e) =>
                        setTeamInvites((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, email: e.target.value } : item,
                          ),
                        )
                      }
                    />
                    <Select
                      id={`inviteRole-${index}`}
                      label={index === 0 ? "Role" : undefined}
                      value={row.role}
                      onChange={(e) =>
                        setTeamInvites((rows) =>
                          rows.map((item, i) =>
                            i === index ? { ...item, role: e.target.value } : item,
                          ),
                        )
                      }
                    >
                      {user?.role === "vendor_admin" ? (
                        <>
                          <option value="vendor_field_lead">Field Lead</option>
                          <option value="vendor_supervisor">Supervisor</option>
                          <option value="vendor_manager">Manager</option>
                          <option value="vendor_worker">Worker</option>
                        </>
                      ) : (
                        <>
                          <option value="spx_account_handler">SPX Account Handler</option>
                          <option value="spx_field_supervisor">SPX Field Supervisor</option>
                        </>
                      )}
                    </Select>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setTeamInvites((rows) => [...rows, { email: "", role: "vendor_field_lead" }])}
              >
                Add another
              </Button>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setPhase("intro")}>
                  Back to walkthrough
                </Button>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setSetupStep(brandingStep)}>
                    Skip for now
                  </Button>
                  <Button className="w-full sm:w-auto" disabled={busy} onClick={sendTeamInvites}>
                    {teamInvites.some((row) => row.email.trim()) ? "Send invites & continue" : "Continue"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {phase === "setup" && setupStep === brandingStep && (
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm sm:p-6">
              <h2 className="font-display text-xl">Workspace branding</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {canEditBranding
                  ? "This is how your workspace will appear across dashboards (display name + tagline)."
                  : "Add an optional tagline, then continue to your dashboard. Your admin can update the display name in Settings."}
              </p>

              <div className="mt-4 rounded-xl border border-border/70 bg-background/30 p-4">
                <p className="text-sm font-medium">Tip</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You can change branding later under{" "}
                  <span className="font-mono">Settings → Organization</span>. Team invites can be sent anytime from{" "}
                  <span className="font-mono">Settings → Team</span>.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {canEditBranding ? (
                  <Input
                    id="displayName"
                    label="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                ) : null}
                <Input
                  id="tagline"
                  label="Tagline"
                  placeholder="Short line under your name"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onClick={() => (canInvite ? setSetupStep(1) : setPhase("intro"))}
                  >
                    {canInvite ? "Back" : "Back to walkthrough"}
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
              {wizardSteps.map((s, idx) => {
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
                Inviting your team early keeps field evidence, work orders, and payment requests tied to the right
                people — without mixing raw data between desks.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
