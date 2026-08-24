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
import { useAuthStore } from "@/stores/auth-store";
import { AuthBackLink, AuthCard, AuthMobileHeader } from "@/components/auth/auth-card";
import { AuthRedirectLoader } from "@/components/layout/workspace-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { setTokens, setSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && accessToken) {
      setRedirecting(true);
      router.replace("/dashboard");
    }
  }, [mounted, accessToken, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      setRedirecting(true);
      const res = await authApi.login(data.email, data.password);
      setTokens(res.accessToken, res.refreshToken);
      const me = await authApi.me();
      setSession(me.user, me.permissions, {
        tenant: me.tenant,
        activeProgram: me.activeProgram,
        programs: me.programs,
      });
      router.push(me.activeProgram ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      setRedirecting(false);
      setError(getApiErrorMessage(err, "Invalid credentials"));
    }
  };

  if (!mounted || redirecting || accessToken) {
    return (
      <>
        <AuthMobileHeader />
        <AuthRedirectLoader />
      </>
    );
  }

  return (
    <>
      <AuthMobileHeader />
      <div className="w-full max-w-[440px] animate-fade-in">
        <AuthBackLink />

        <AuthCard
          title="Sign in"
          description={
            <>
              Access your program workspace. New here?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Apply for access
              </Link>
              .
            </>
          }
        >
          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11">
              {isSubmitting ? (
                "Signing in…"
              ) : (
                <span className="flex items-center gap-2">
                  Sign in to workspace
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </AuthCard>
      </div>
    </>
  );
}
