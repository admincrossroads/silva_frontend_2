"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registrationApi } from "@/lib/api/registration";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useActivateAccount } from "@/hooks/use-registration";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ActivatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const { setTokens, setSession } = useAuthStore();
  const activate = useActivateAccount();
  const [info, setInfo] = useState<{ orgName: string; contactName: string; contactEmail: string } | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Missing activation token.");
      return;
    }
    registrationApi
      .checkActivation(token)
      .then((data) => {
        setInfo(data);
        setName(data.contactName);
      })
      .catch(() => setError("This activation link is invalid or has expired. Contact SPX for a new link."))
      .finally(() => setLoading(false));
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await activate.mutateAsync({ token, password, name: name.trim() });
      setTokens(res.accessToken, res.refreshToken);
      const me = await authApi.me();
      setSession(me.user, me.permissions, {
        tenant: me.tenant,
        activeProgram: me.activeProgram,
        programs: me.programs,
      });
      router.push(me.activeProgram ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Activation failed."));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Verifying activation link…</p>;
  }

  if (!info) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl">Activation link invalid</h1>
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Activate your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          SPX approved <strong>{info.orgName}</strong>. Set your password to sign in as {info.contactEmail}.
        </p>
      </div>
      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        <Input id="name" label="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input id="confirm" label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={activate.isPending}>
          {activate.isPending ? "Activating…" : "Activate & sign in"}
        </Button>
      </form>
    </div>
  );
}
