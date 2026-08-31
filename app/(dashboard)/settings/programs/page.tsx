"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProgramInfo } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/hooks/use-role";

type Member = {
  id: string;
  organizationName: string;
  organizationSlug: string;
  organizationType: string;
  roleInProgram: string;
};

type Invite = {
  id: string;
  toOrgSlug: string | null;
  toEmail: string | null;
  roleInProgram: string;
  status: string;
  acceptToken?: string | null;
};

export default function ProgramsSettingsPage() {
  const qc = useQueryClient();
  const { isSpx } = useRole();
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [inviteSlug, setInviteSlug] = useState("");
  const [roleInProgram, setRoleInProgram] = useState("executor");
  const [lastAcceptToken, setLastAcceptToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { data: programs = [], isLoading } = useQuery<ProgramInfo[]>({
    queryKey: ["programs"],
    queryFn: () => programApi.list(),
  });

  const programId = selectedId || programs[0]?.id || "";

  const membersQuery = useQuery<Member[]>({
    queryKey: ["program-members", programId],
    queryFn: () => programApi.listMembers(programId),
    enabled: Boolean(programId),
  });

  const invitesQuery = useQuery<Invite[]>({
    queryKey: ["program-invites", programId],
    queryFn: () => programApi.listInvites(programId),
    enabled: Boolean(programId),
  });

  const create = useMutation({
    mutationFn: () => programApi.create({ name, slug: slug || undefined }),
    meta: { successMessage: "Program created", errorMessage: "Could not create program" },
    onSuccess: (p) => {
      setName("");
      setSlug("");
      setError("");
      setSelectedId(p.id);
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create program")),
  });

  const invite = useMutation({
    mutationFn: () =>
      programApi.inviteOrg(programId, { orgSlug: inviteSlug, roleInProgram }),
    meta: { successMessage: "Invite sent", errorMessage: "Invite failed" },
    onSuccess: (res) => {
      setInviteSlug("");
      setError("");
      setLastAcceptToken(res.acceptToken ?? null);
      qc.invalidateQueries({ queryKey: ["program-members", programId] });
      qc.invalidateQueries({ queryKey: ["program-invites", programId] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Invite failed")),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Programs</h1>
        <Button variant="outline" asChild>
          <Link href="/settings/programs/accept">Accept invite</Link>
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isSpx ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create program</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} className="sm:flex-1" />
            <Input
              label="Slug (optional)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="sm:w-48"
            />
            <Button disabled={!name.trim() || create.isPending} onClick={() => create.mutate()}>
              Create
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your programs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : programs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No programs yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {programs.map((p) => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={programId === p.id ? "default" : "outline"}
                  onClick={() => setSelectedId(p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {programId ? (
        <>
          {isSpx ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invite organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Input
                    label="Org slug"
                    value={inviteSlug}
                    onChange={(e) => setInviteSlug(e.target.value)}
                    className="sm:flex-1"
                  />
                  <NativeSelect
                    label="Role in program"
                    value={roleInProgram}
                    onChange={(e) => setRoleInProgram(e.target.value)}
                    className="sm:w-44"
                  >
                    <option value="owner">owner</option>
                    <option value="manager">manager</option>
                    <option value="executor">executor</option>
                    <option value="viewer">viewer</option>
                  </NativeSelect>
                  <Button
                    disabled={!inviteSlug.trim() || invite.isPending}
                    onClick={() => invite.mutate()}
                  >
                    Invite
                  </Button>
                </div>
                {lastAcceptToken ? (
                  <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    Pending email invite token:{" "}
                    <code className="break-all font-mono text-xs">{lastAcceptToken}</code>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(membersQuery.data ?? []).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {m.organizationName}{" "}
                        <span className="text-xs text-muted-foreground">({m.organizationSlug})</span>
                      </TableCell>
                      <TableCell>{m.organizationType}</TableCell>
                      <TableCell>{m.roleInProgram}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invitesQuery.data ?? []).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.toOrgSlug || inv.toEmail || "—"}</TableCell>
                      <TableCell>{inv.roleInProgram}</TableCell>
                      <TableCell>{inv.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
