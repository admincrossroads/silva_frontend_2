"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { inviteApi } from "@/lib/api/invites";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { postAuthRedirect } from "@/lib/utils/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteId = params.get("inviteId") || "";
  const token = params.get("token") || "";
  const { setTokens, setSession } = useAuthStore();
  const [info, setInfo] = useState<{ email: string; orgName: string; role: string } | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!inviteId || !token) {
      setLoading(false);
      setError("Missing invitation link parameters.");
      return;
    }
    inviteApi
      .preview(inviteId, token)
      .then((data) => setInfo(data))
      .catch(() => setError("This invitation is invalid or has expired. Ask your administrator to resend it."))
      .finally(() => setLoading(false));
  }, [inviteId, token]);

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
    setSubmitting(true);
    try {
      const res = await inviteApi.accept(inviteId, { token, password, name: name.trim() });
      setTokens(res.accessToken, res.refreshToken);
      const me = await authApi.me();
      setSession(me.user, me.permissions, {
        tenant: me.tenant,
        activeProgram: me.activeProgram,
        programs: me.programs,
      });
      router.push(
        me.user.role === "vendor_admin" || me.user.role === "spx_principal"
          ? postAuthRedirect(me)
          : "/dashboard",
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not accept invitation."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Verifying invitation…</p>;
  }

  if (!info) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl">Invitation invalid</h1>
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
        <h1 className="font-display text-3xl text-foreground">Accept your invitation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join <strong>{info.orgName}</strong> as <span className="capitalize">{info.role.replace(/_/g, " ")}</span>.
          Set your password for {info.email}.
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
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Accept invitation"}
        </Button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Verifying invitation…</p>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
