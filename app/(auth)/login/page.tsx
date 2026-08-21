"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, User, Shield, Truck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const demoAccounts = [
  { label: "Silva Owner", email: "owner@silva.example", icon: User },
  { label: "SPX Principal", email: "principal@spx.example", icon: Shield },
  { label: "B-Agro Field Lead", email: "lead@bagro.example", icon: Truck },
];

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setSession } = useAuthStore();
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const doLogin = async (email: string, password: string) => {
    setError("");
    const res = await authApi.login(email, password);
    setTokens(res.accessToken, res.refreshToken);
    const me = await authApi.me();
    setSession(me.user, me.permissions, {
      tenant: me.tenant,
      activeProgram: me.activeProgram,
      programs: me.programs,
    });
    router.push(me.activeProgram ? "/dashboard" : "/onboarding");
  };

  const onSubmit = async (data: FormData) => {
    try {
      await doLogin(data.email, data.password);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Invalid credentials"));
    }
  };

  const onDemoLogin = async (email: string) => {
    try {
      setDemoLoading(email);
      await doLogin(email, "Password123!");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Demo login failed — is the API running on :5000?"));
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="lg:hidden font-display text-xl text-foreground">Coffee Field OS</p>
        <h1 className="font-display text-3xl text-foreground tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Access your tenant workspace. Or{" "}
          <Link href="/signup" className="text-primary font-medium">
            create an organization
          </Link>
          .
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium">
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
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : (
            <span className="flex items-center gap-2">
              Sign in <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Seeded demo
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {demoAccounts.map((demo) => (
          <button
            key={demo.email}
            type="button"
            disabled={!!demoLoading || isSubmitting}
            onClick={() => onDemoLogin(demo.email)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-accent/60 disabled:opacity-50"
          >
            <demo.icon className="h-4 w-4 text-primary" />
            <span className="flex-1 text-left">{demo.label}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-40" />
          </button>
        ))}
      </div>
    </div>
  );
}
