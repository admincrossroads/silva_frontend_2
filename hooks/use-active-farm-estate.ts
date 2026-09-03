"use client";

import { useEffect } from "react";
import {
  farmEstatesEmptyMessage,
  useVendorFarmEstates,
} from "@/hooks/use-vendor-farm-estates";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useActiveFarmEstate() {
  const activeFarmEstateId = useWorkspaceStore((s) => s.activeFarmEstateId);
  const setActiveFarmEstateId = useWorkspaceStore((s) => s.setActiveFarmEstateId);
  const resetForProgram = useWorkspaceStore((s) => s.resetForProgram);

  const { estates, isLoading, reason, activeProgram, tenantName } = useVendorFarmEstates({
    status: "active",
  });

  useEffect(() => {
    resetForProgram(activeProgram?.id ?? null);
  }, [activeProgram?.id, resetForProgram]);

  useEffect(() => {
    if (!estates.length) {
      if (activeFarmEstateId) setActiveFarmEstateId(null);
      return;
    }
    const current = estates.find((e) => e.id === activeFarmEstateId);
    if (!current) setActiveFarmEstateId(estates[0].id);
  }, [estates, activeFarmEstateId, setActiveFarmEstateId]);

  const activeFarmEstate = estates.find((e) => e.id === activeFarmEstateId) ?? null;
  const emptyMessage = farmEstatesEmptyMessage(reason, tenantName);

  return {
    estates,
    activeFarmEstate,
    activeFarmEstateId,
    setActiveFarmEstateId,
    isLoading,
    reason,
    emptyMessage,
  };
}
