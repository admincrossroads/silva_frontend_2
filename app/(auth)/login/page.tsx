"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth-store";
import { AuthBackLink, AuthCard } from "@/components/auth/auth-card";
import { AuthRedirectLoader } from "@/components/layout/workspace-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postAuthRedirect } from "@/lib/utils/onboarding";
import type { LoginResponse } from "@/types";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;
type LoginStep = "credentials" | "enroll" | "otp";

type DemoAccount = {
  org: string;
  role: string;
  email: string;
};

/** Workflow actors with approve / execute privileges — password Password123! for all */
const DEMO_ACCOUNTS: DemoAccount[] = [
  // Silva — govern / approve
  { org: "Silva", role: "Owner", email: "owner@silva.example" },
  { org: "Silva", role: "Country manager", email: "naomi@silva.example" },
  { org: "Silva", role: "Finance", email: "finance@silva.example" },
  // SPX — plan, validate, issue
  { org: "SPX", role: "Principal", email: "principal@spx.example" },
  { org: "SPX", role: "Account handler", email: "handler@spx.example" },
  { org: "SPX", role: "Field supervisor", email: "supervisor@spx.example" },
  { org: "SPX", role: "System admin", email: "admin@spx.example" },
  // B-Agro — execute / vendor review
  { org: "B-Agro", role: "Admin", email: "admin@bagro.example" },
  { org: "B-Agro", role: "Field lead", email: "lead@bagro.example" },
  { org: "B-Agro", role: "Supervisor", email: "supervisor@bagro.example" },
];

const DEMO_PASSWORD = "Password123!";
const DEMO_GROUPS = ["Silva", "SPX", "B-Agro"] as const;

export default function LoginPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const tenant = useAuthStore((s) => s.tenant);
  const { setTokens, setSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<LoginStep>("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpChallengeToken, setOtpChallengeToken] = useState("");
  const [enrollmentToken, setEnrollmentToken] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpOnLogin, setOtpOnLogin] = useState<boolean | null>(null);

  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    setMounted(true);
    router.prefetch("/dashboard");
    router.prefetch("/onboarding");
    authApi
      .config()
      .then((config) => setOtpOnLogin(config.otpOnLogin))
      .catch(() => setOtpOnLogin(true));
  }, [router]);

  useEffect(() => {
    if (otpOnLogin === false && step !== "credentials") {
      setStep("credentials");
      setOtpChallengeToken("");
      setEnrollmentToken("");
      setQrDataUrl("");
      setOtpCode("");
      setPendingEmail("");
    }
  }, [otpOnLogin, step]);

  useEffect(() => {
    if (mounted && accessToken && user) {
      setRedirecting(true);
      const completed = Boolean(
        (tenant?.branding as { onboardingCompletedAt?: string } | null)?.onboardingCompletedAt,
      );
      router.replace(completed ? "/dashboard" : "/onboarding");
    }
  }, [mounted, accessToken, user, tenant, router]);

  const completeSession = async (res: LoginResponse) => {
    if (!res.accessToken || !res.refreshToken) {
      throw new Error("Missing authentication tokens");
    }
    setTokens(res.accessToken, res.refreshToken);
    const me = res.me ?? (await authApi.me());
    setSession(me.user, me.permissions, {
      tenant: me.tenant,
      activeProgram: me.activeProgram,
      programs: me.programs,
    });
    router.replace(postAuthRedirect(me));
  };

  const resetMfaFlow = () => {
    setStep("credentials");
    setOtpChallengeToken("");
    setEnrollmentToken("");
    setQrDataUrl("");
    setOtpCode("");
    setPendingEmail("");
    setRedirecting(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      setRedirecting(true);
      const res = await authApi.login(data.email, data.password);

      if (otpOnLogin !== false) {
        if (res.requiresTotpEnrollment) {
          setRedirecting(false);
          setStep("enroll");
          setPendingEmail(res.user?.email ?? data.email);
          setEnrollmentToken(res.enrollmentToken ?? "");
          setQrDataUrl(res.qrDataUrl ?? "");
          return;
        }

        if (res.requiresOtp) {
          setRedirecting(false);
          setStep("otp");
          setPendingEmail(res.user?.email ?? data.email);
          setOtpChallengeToken(res.otpChallengeToken ?? "");
          return;
        }
      } else if (res.requiresTotpEnrollment || res.requiresOtp) {
        throw new Error("OTP is disabled but the server requested verification. Restart the API server.");
      }

      await completeSession(res);
    } catch (err: unknown) {
      setRedirecting(false);
      setError(getApiErrorMessage(err, "Invalid credentials"));
      toast.error(err, "Invalid credentials");
    }
  };

  const onVerifyOtp = async () => {
    if (!otpChallengeToken || otpCode.trim().length < 6) return;
    try {
      setOtpSubmitting(true);
      setError("");
      const res = await authApi.verifyOtp(otpChallengeToken, otpCode.trim());
      setRedirecting(true);
      await completeSession(res);
    } catch (err: unknown) {
      setRedirecting(false);
      setError(getApiErrorMessage(err, "Invalid verification code"));
      toast.error(err, "Invalid verification code");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const onEnrollTotp = async () => {
    if (!enrollmentToken || otpCode.trim().length < 6) return;
    try {
      setOtpSubmitting(true);
      setError("");
      const res = await authApi.enrollTotp(enrollmentToken, otpCode.trim());
      setRedirecting(true);
      await completeSession(res);
    } catch (err: unknown) {
      setRedirecting(false);
      setError(getApiErrorMessage(err, "Could not complete authenticator setup"));
      toast.error(err, "Could not complete authenticator setup");
    } finally {
      setOtpSubmitting(false);
    }
  };

  if (!mounted || redirecting || (accessToken && user)) {
    return <AuthRedirectLoader />;
  }

  if (otpOnLogin !== false && step === "enroll") {
    return (
      <div className="w-full animate-fade-in">
        <AuthBackLink />
        <AuthCard
          title="Set up authenticator"
          description={
            <>
              Scan the QR code with your authenticator app, then enter the 6-digit code for{" "}
              <span className="font-medium text-foreground">{pendingEmail}</span>.
            </>
          }
        >
          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive sm:px-4 sm:py-3">
              {error}
            </div>
          ) : null}

          {qrDataUrl ? (
            <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Authenticator QR code" className="h-44 w-44" />
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="enroll-code">Verification code</Label>
              <Input
                id="enroll-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                className="h-11 text-center font-mono text-lg tracking-[0.3em] sm:h-10"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="h-11 sm:flex-1" onClick={resetMfaFlow}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                className="h-11 sm:flex-1"
                disabled={otpSubmitting || otpCode.trim().length < 6}
                onClick={onEnrollTotp}
              >
                {otpSubmitting ? "Verifying…" : "Complete setup"}
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (otpOnLogin !== false && step === "otp") {
    return (
      <div className="w-full animate-fade-in">
        <AuthBackLink />
        <AuthCard
          title="Two-factor verification"
          description={
            <>
              Enter the 6-digit code from your authenticator app for{" "}
              <span className="font-medium text-foreground">{pendingEmail}</span>.
            </>
          }
        >
          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive sm:px-4 sm:py-3">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp-code">Verification code</Label>
              <Input
                id="otp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                className="h-11 text-center font-mono text-lg tracking-[0.3em] sm:h-10"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void onVerifyOtp();
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="h-11 sm:flex-1" onClick={resetMfaFlow}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                className="h-11 sm:flex-1"
                disabled={otpSubmitting || otpCode.trim().length < 6}
                onClick={onVerifyOtp}
              >
                {otpSubmitting ? "Verifying…" : "Verify and sign in"}
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <AuthBackLink />

      <AuthCard
        title="Sign in"
        description="Access your program workspace with your organization account."
      >
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive sm:px-4 sm:py-3">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className="h-11 text-base sm:h-10 sm:text-sm"
              {...register("email")}
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 text-base sm:h-10 sm:text-sm"
              {...register("password")}
            />
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || otpOnLogin === null}
            className="h-11 w-full text-[15px] sm:text-sm"
          >
            {isSubmitting ? (
              "Signing in…"
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign in to workspace
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </AuthCard>

      <div className="mt-4 px-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Demo accounts</p>
          <p className="font-mono text-[11px] text-muted-foreground/80">{DEMO_PASSWORD}</p>
        </div>
        <div className="space-y-1.5">
          {DEMO_GROUPS.map((org) => (
            <div key={org} className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="w-12 shrink-0 text-[11px] font-medium text-muted-foreground">{org}</span>
              {DEMO_ACCOUNTS.filter((a) => a.org === org).map((account) => (
                <button
                  key={account.email}
                  type="button"
                  title={account.email}
                  className="rounded-md border bg-background px-2 py-0.5 text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  onClick={() => {
                    setValue("email", account.email, { shouldValidate: true });
                    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
                    setError("");
                  }}
                >
                  {account.role}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
