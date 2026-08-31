"use client";

import { useEffect, useState } from "react";
import {
  useAssignCropfortRoles,
  useCropfortAdminUsers,
  useCropfortTenantConfig,
  useSuspendCropfortUser,
  useUpdateCropfortTenantConfig,
} from "@/hooks/use-cropfort-admin";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CropfortRoleName } from "@/lib/api/cropfort/admin";

const CROPFORT_ROLES: CropfortRoleName[] = [
  "field_supervisor",
  "bagro_office",
  "spx_validator",
  "farm_owner",
  "spx_platform_admin",
];

export default function CropfortAdminPage() {
  const { role } = useRole();
  const isAdmin = role === "system_admin";
  const { data: users = [], isLoading: usersLoading } = useCropfortAdminUsers();
  const { data: config, isLoading: configLoading } = useCropfortTenantConfig();
  const updateConfig = useUpdateCropfortTenantConfig();
  const assignRoles = useAssignCropfortRoles();
  const suspendUser = useSuspendCropfortUser();

  const [form, setForm] = useState({
    cropfortOpexReserveBalanceEtb: "",
    cropfortRateFlagThresholdPct: "10",
    cropfortPartialWeeklyRelease: false,
  });

  useEffect(() => {
    if (!config) return;
    setForm({
      cropfortOpexReserveBalanceEtb: String(config.cropfortOpexReserveBalanceEtb ?? ""),
      cropfortRateFlagThresholdPct: String(config.cropfortRateFlagThresholdPct ?? 10),
      cropfortPartialWeeklyRelease: config.cropfortPartialWeeklyRelease ?? false,
    });
  }, [config]);

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Cropfort tenant admin is restricted to SPX platform administrators.
      </div>
    );
  }

  const saveConfig = async () => {
    await updateConfig.mutateAsync({
      cropfortOpexReserveBalanceEtb: form.cropfortOpexReserveBalanceEtb
        ? Number(form.cropfortOpexReserveBalanceEtb)
        : null,
      cropfortRateFlagThresholdPct: Number(form.cropfortRateFlagThresholdPct),
      cropfortPartialWeeklyRelease: form.cropfortPartialWeeklyRelease,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cropfort admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tenant configuration, Cropfort role assignment, and user suspension.
        </p>
      </div>

      <Card className="space-y-4 p-4">
        <h2 className="text-sm font-semibold">Tenant configuration</h2>
        {configLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Opex reserve balance (ETB)</Label>
              <Input
                type="number"
                value={form.cropfortOpexReserveBalanceEtb}
                onChange={(e) => setForm((f) => ({ ...f, cropfortOpexReserveBalanceEtb: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rate flag threshold (%)</Label>
              <Input
                type="number"
                value={form.cropfortRateFlagThresholdPct}
                onChange={(e) => setForm((f) => ({ ...f, cropfortRateFlagThresholdPct: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.cropfortPartialWeeklyRelease}
                  onChange={(e) => setForm((f) => ({ ...f, cropfortPartialWeeklyRelease: e.target.checked }))}
                />
                Allow partial weekly release
              </label>
            </div>
            <div className="flex items-end">
              <Button onClick={saveConfig} disabled={updateConfig.isPending}>
                Save config
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Program users & Cropfort roles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Field OS role</th>
                <th className="px-3 py-2 font-medium">Cropfort roles</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div>{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {u.cropfortRoles.length ? (
                          u.cropfortRoles.map((r) => (
                            <Badge key={r.role} variant="outline">
                              {r.role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Select
                          onValueChange={(v) =>
                            assignRoles.mutate({
                              userId: u.id,
                              roles: [{ role: v as CropfortRoleName }],
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-40">
                            <SelectValue placeholder="Add role" />
                          </SelectTrigger>
                          <SelectContent>
                            {CROPFORT_ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {u.active ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => suspendUser.mutate(u.id)}
                            disabled={suspendUser.isPending}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
