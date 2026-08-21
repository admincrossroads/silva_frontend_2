"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function ProfilePage() {
  const { user } = useAuth();
  const setSession = useAuthStore((s) => s.setSession);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  useEffect(() => {
    if (user?.name) profile.reset({ name: user.name });
  }, [user?.name]);

  const password = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="space-y-1">
        <h2 className="font-display text-2xl text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profile.handleSubmit(async (values) => {
              if (!user) return;
              setProfileErr("");
              setProfileMsg("");
              try {
                await authApi.updateProfile(user.id, { name: values.name });
                const me = await authApi.me();
                setSession(me.user, me.permissions);
                setProfileMsg("Profile saved.");
              } catch (err) {
                setProfileErr(getApiErrorMessage(err, "Could not save profile"));
              }
            })}
            className="space-y-4"
          >
            <Input
              id="name"
              label="Full Name"
              error={profile.formState.errors.name?.message}
              {...profile.register("name")}
            />
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                readOnly
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <div>
                <Badge>{user?.role ?? "—"}</Badge>
              </div>
            </div>
            {profileErr && <p className="text-sm text-destructive">{profileErr}</p>}
            {profileMsg && <p className="text-sm text-primary">{profileMsg}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={profile.formState.isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
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
              label="Current Password"
              type="password"
              error={password.formState.errors.currentPassword?.message}
              {...password.register("currentPassword")}
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              error={password.formState.errors.newPassword?.message}
              {...password.register("newPassword")}
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              error={password.formState.errors.confirmPassword?.message}
              {...password.register("confirmPassword")}
            />
            {passwordErr && <p className="text-sm text-destructive">{passwordErr}</p>}
            {passwordMsg && <p className="text-sm text-primary">{passwordMsg}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={password.formState.isSubmitting}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
