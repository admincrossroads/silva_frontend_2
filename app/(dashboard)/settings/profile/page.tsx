"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, KeyRound, Layers, Shield, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContent } from "@/components/layout/page-shell";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(1, "Required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function orgTypeLabel(type: string | undefined) {
  switch (type) {
    case "silva":
      return "Asset owner";
    case "spx":
      return "Program manager";
    case "vendor":
      return "Execution vendor";
    default:
      return type?.replace(/_/g, " ") ?? "—";
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-medium", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, tenant, activeProgram, refreshSession } = useAuth();
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const role = (user?.role ?? "") as RoleKey;
  const roleLabel = ROLES[role] ?? user?.role ?? "—";

  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    if (user?.name) profile.reset({ name: user.name });
  }, [user?.name, profile]);

  const password = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const avatarInitials = useMemo(() => initials(user?.name ?? "?"), [user?.name]);

  if (!user) return null;

  return (
    <PageContent className="max-w-3xl">
      <section className="space-y-1">
        <h2 className="font-display text-2xl text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Your account details, workspace context, and sign-in security.
        </p>
      </section>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {avatarInitials}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge>{roleLabel}</Badge>
              <Badge variant="outline">{orgTypeLabel(user.organizationType)}</Badge>
              {user.active ? (
                <Badge variant="secondary">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Organization" value={tenant?.displayName ?? tenant?.name ?? "—"} />
            <InfoRow label="Org ID" value={user.organizationId} mono />
            <InfoRow label="Active program" value={activeProgram?.name ?? "None selected"} />
            {activeProgram ? <InfoRow label="Program ID" value={activeProgram.id} mono /> : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href="/settings/organization">
                  <Building2 className="mr-1.5 h-3.5 w-3.5" />
                  Organization
                </Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/settings/programs">
                  <Layers className="mr-1.5 h-3.5 w-3.5" />
                  Programs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Role" value={roleLabel} />
            <InfoRow label="User ID" value={user.id} mono />
            {user.vendorId ? <InfoRow label="Vendor ID" value={user.vendorId} mono /> : null}
            <InfoRow label="Account status" value={user.active ? "Active" : "Inactive"} />
            <p className="pt-1 text-xs text-muted-foreground">
              Role and organization membership are managed by your program administrator.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profile.handleSubmit(async (values) => {
              setProfileErr("");
              setProfileMsg("");
              try {
                await authApi.updateProfile(user.id, { name: values.name });
                await refreshSession();
                setProfileMsg("Profile saved.");
              } catch (err) {
                setProfileErr(getApiErrorMessage(err, "Could not save profile"));
              }
            })}
            className="space-y-4"
          >
            <Input
              id="name"
              label="Full name"
              error={profile.formState.errors.name?.message}
              {...profile.register("name")}
            />
            <Input
              id="email"
              label="Email"
              value={user.email}
              readOnly
              className="cursor-not-allowed bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email is tied to your login and cannot be changed here. Contact your administrator if
              it needs updating.
            </p>
            {profileErr ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {profileErr}
              </p>
            ) : null}
            {profileMsg ? (
              <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                {profileMsg}
              </p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={profile.formState.isSubmitting}>
                {profile.formState.isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={password.handleSubmit(async (values) => {
              setPasswordErr("");
              setPasswordMsg("");
              try {
                await authApi.changePassword(values.currentPassword, values.newPassword);
                password.reset();
                setPasswordMsg("Password updated.");
              } catch (err) {
                setPasswordErr(getApiErrorMessage(err, "Could not update password"));
              }
            })}
            className="space-y-4"
          >
            <Input
              id="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={password.formState.errors.currentPassword?.message}
              {...password.register("currentPassword")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                error={password.formState.errors.newPassword?.message}
                {...password.register("newPassword")}
              />
              <Input
                id="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={password.formState.errors.confirmPassword?.message}
                {...password.register("confirmPassword")}
              />
            </div>
            {passwordErr ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {passwordErr}
              </p>
            ) : null}
            {passwordMsg ? (
              <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                {passwordMsg}
              </p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={password.formState.isSubmitting}>
                {password.formState.isSubmitting ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContent>
  );
}
