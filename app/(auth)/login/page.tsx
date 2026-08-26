"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth-store";
import { AuthBackLink, AuthCard } from "@/components/auth/auth-card";
import { AuthRedirectLoader } from "@/components/layout/workspace-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS: { group: string; emails: string[] }[] = [
  {
    group: "Silva",
    emails: ["owner@silva.example", "naomi@silva.example", "finance@silva.example"],
  },
  {
    group: "SPX",
    emails: [
      "principal@spx.example",
      "handler@spx.example",
      "supervisor@spx.example",
      "admin@spx.example",
    ],
  },
  {
    group: "B-Agro",
    emails: [
      "admin@bagro.example",
      "lead@bagro.example",
      "supervisor@bagro.example",
      "worker@bagro.example",
    ],
  },
  {
    group: "Highland",
    emails: ["admin@highland.example"],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const activeProgram = useAuthStore((s) => s.activeProgram);
  const { setTokens, setSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

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
  }, [router]);

  useEffect(() => {
    if (mounted && accessToken && user) {
      setRedirecting(true);
      router.replace(activeProgram ? "/dashboard" : "/onboarding");
    }
  }, [mounted, accessToken, user, activeProgram, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      setRedirecting(true);
      const res = await authApi.login(data.email, data.password);
      setTokens(res.accessToken, res.refreshToken);

      const me = res.me ?? (await authApi.me());
      setSession(me.user, me.permissions, {
        tenant: me.tenant,
        activeProgram: me.activeProgram,
        programs: me.programs,
      });
      router.replace(me.activeProgram ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      setRedirecting(false);
      setError(getApiErrorMessage(err, "Invalid credentials"));
      toast.error(err, "Invalid credentials");
    }
  };

  if (!mounted || redirecting || (accessToken && user)) {
    return <AuthRedirectLoader />;
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

          <Button type="submit" disabled={isSubmitting} className="h-11 w-full text-[15px] sm:text-sm">
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
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
          Demo accounts
        </p>
        <div className="space-y-2.5">
          {DEMO_ACCOUNTS.map((group) => (
            <div key={group.group}>
              <p className="mb-0.5 text-[10px] text-muted-foreground/70">{group.group}</p>
              <ul className="flex flex-wrap gap-x-2 gap-y-0.5">
                {group.emails.map((email) => (
                  <li key={email}>
                    <button
                      type="button"
                      className="text-[10px] leading-tight text-muted-foreground/90 underline-offset-2 hover:text-foreground hover:underline"
                      onClick={() => {
                        setValue("email", email, { shouldValidate: true });
                        setValue("password", "Password123!", { shouldValidate: true });
                      }}
                    >
                      {email}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
