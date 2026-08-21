"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  orgName: z.string().min(1),
  orgSlug: z.string().optional(),
  orgType: z.enum(["silva", "spx", "vendor"]),
  displayName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { setTokens, setSession } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { orgType: "spx" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await authApi.signup(data);
      setTokens(res.accessToken, res.refreshToken);
      const me = await authApi.me();
      setSession(me.user, me.permissions, {
        tenant: me.tenant,
        activeProgram: me.activeProgram,
        programs: me.programs,
      });
      router.push("/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Signup failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground">Create your workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Each organization is a SaaS tenant. You’ll join or create a Program next.
        </p>
      </div>
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input id="orgName" label="Organization name" error={errors.orgName?.message} {...register("orgName")} />
        <Input id="orgSlug" label="Slug (optional)" placeholder="my-org" {...register("orgSlug")} />
        <Select id="orgType" label="Organization type" {...register("orgType")}>
          <option value="silva">Silva (owner / governance)</option>
          <option value="spx">SPX (manager)</option>
          <option value="vendor">Vendor (executor)</option>
        </Select>
        <Input id="displayName" label="Display name" {...register("displayName")} />
        <Input id="name" label="Your name" error={errors.name?.message} {...register("name")} />
        <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input
          id="password"
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create tenant"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
