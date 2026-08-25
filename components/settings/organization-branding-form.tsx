"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { applyWorkspaceTheme } from "@/lib/branding/workspace-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SpxFarmMark } from "@/components/brand/spx-farm-logo";
import { toast } from "@/lib/toast";
import type { TenantBranding } from "@/types";

const COLOR_PRESETS = ["#166534", "#1d4ed8", "#7c3aed", "#b45309", "#be123c", "#0f766e"];

type BrandingFormState = {
  displayName: string;
  tagline: string;
  primaryColor: string;
  logoUrl: string;
};

function brandingFromTenant(
  displayName: string | undefined,
  branding: TenantBranding | null | undefined,
): BrandingFormState {
  return {
    displayName: displayName ?? "",
    tagline: branding?.tagline ?? "",
    primaryColor: branding?.primaryColor ?? "#166534",
    logoUrl: branding?.logoUrl ?? "",
  };
}

export function OrganizationBrandingForm() {
  const { tenant, refreshSession } = useAuth();
  const setTenantContext = useAuthStore((s) => s.setTenantContext);
  const [form, setForm] = useState<BrandingFormState>(() =>
    brandingFromTenant(tenant?.displayName, tenant?.branding),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(brandingFromTenant(tenant?.displayName, tenant?.branding));
  }, [tenant?.displayName, tenant?.branding]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    applyWorkspaceTheme(form.primaryColor, isDark);
    return () => {
      applyWorkspaceTheme(tenant?.branding?.primaryColor ?? null, isDark);
    };
  }, [form.primaryColor, tenant?.branding?.primaryColor]);

  const handleLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file.");
      return;
    }
    if (file.size > 300_000) {
      setError("Logo must be under 300 KB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, logoUrl: String(reader.result ?? "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await authApi.updateTenantBranding({
        displayName: form.displayName.trim() || tenant?.displayName,
        branding: {
          tagline: form.tagline.trim(),
          primaryColor: form.primaryColor,
          logoUrl: form.logoUrl.trim() || undefined,
        },
      });
      setTenantContext({ tenant: updated });
      await refreshSession();
      const isDark = document.documentElement.classList.contains("dark");
      applyWorkspaceTheme(form.primaryColor, isDark);
      toast.success("Organization settings saved");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Could not save organization settings");
      setError(msg);
      toast.error(err, "Could not save organization settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4" />
          Organization & workspace branding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Input
              label="Display name"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Your organization name"
            />
            <Input
              label="Tagline"
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              placeholder="Short line shown in the workspace"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Workspace color</label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform hover:scale-105",
                      form.primaryColor === color ? "border-foreground ring-2 ring-primary/30" : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((f) => ({ ...f, primaryColor: color }))}
                  />
                ))}
                <Input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="h-10 w-14 cursor-pointer p-1"
                  aria-label="Custom workspace color"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="w-28 font-mono text-xs"
                  placeholder="#166534"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Input
                label="Logo URL"
                value={form.logoUrl.startsWith("data:") ? "" : form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://… or upload below"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Upload logo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />
                <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, max 300 KB.</p>
              </div>
              {form.logoUrl ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}
                >
                  Remove logo
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Preview</p>
            <div className="overflow-hidden rounded-xl border bg-muted/30 p-3">
              <div className="flex gap-3">
                <div className="app-sidebar w-28 shrink-0 overflow-hidden rounded-xl border border-sidebar-border shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-sidebar-brand via-primary to-sidebar-brand/40" />
                  <div className="space-y-2 p-2">
                    <div className="flex items-center gap-2">
                      {form.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-sidebar-brand">
                          <SpxFarmMark className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-sidebar-foreground">
                          {form.displayName || "Org"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md bg-primary/15 px-2 py-1 text-[9px] font-medium text-sidebar-brand">
                      Active
                    </div>
                    <div className="rounded-md px-2 py-1 text-[9px] text-sidebar-foreground/55">Item</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {form.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.logoUrl}
                        alt=""
                        className="h-11 w-11 rounded-xl object-cover ring-1 ring-border"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <SpxFarmMark className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{form.displayName || "Organization name"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {form.tagline || "Workspace tagline"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                      Primary action
                    </span>
                    <span className="rounded-md border px-3 py-1.5 text-xs font-medium">Secondary</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || !form.displayName.trim()}>
            {saving ? "Saving…" : "Save organization settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
