"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useFarmEstates } from "@/hooks/use-farm-estates";

export type VendorFarmEstatesReason = "no_program" | "no_mapping" | "api_error" | null;

export function useVendorFarmEstates(params?: { status?: string; enabled?: boolean }) {
  const activeProgram = useAuthStore((s) => s.activeProgram);
  const tenant = useAuthStore((s) => s.tenant);
  const enabled = params?.enabled ?? true;
  const queryEnabled = enabled && Boolean(activeProgram);

  const query = useFarmEstates({
    status: params?.status,
    enabled: queryEnabled,
  });

  const estates = query.data ?? [];

  let reason: VendorFarmEstatesReason = null;
  if (enabled && !activeProgram) {
    reason = "no_program";
  } else if (queryEnabled && !query.isLoading && !query.isError && estates.length === 0) {
    reason = "no_mapping";
  } else if (query.isError) {
    reason = "api_error";
  }

  return {
    estates,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    reason,
    activeProgram,
    tenantName: tenant?.displayName || tenant?.name || "your organization",
  };
}

export function farmEstatesEmptyMessage(
  reason: VendorFarmEstatesReason,
  tenantName: string,
): string | null {
  if (reason === "no_program") {
    return "No program selected — contact SPX to add your organization to the farm program.";
  }
  if (reason === "no_mapping") {
    return `No farm area assigned — ask SPX to map ${tenantName} on the estate under Settings → Farm estates.`;
  }
  if (reason === "api_error") {
    return "Could not load farm areas. Check your connection or try again.";
  }
  return null;
}
