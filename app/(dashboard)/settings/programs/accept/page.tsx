"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { programApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AcceptProgramInvitePage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const accept = async () => {
    if (!token.trim()) return;
    setPending(true);
    setError("");
    try {
      await programApi.acceptInvite(token.trim());
      await refreshSession();
      router.push("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not accept invite"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Accept program invite</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            label="Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste accept token"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button disabled={!token.trim() || pending} onClick={accept}>
            Accept & go to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
