"use client";

import { useAuthStore } from "@/stores/auth-store";

export function usePermissions() {
  const permissions = useAuthStore((s) => s.permissions);
  const has = (key: string) => permissions.includes(key);
  return { permissions, has };
}
