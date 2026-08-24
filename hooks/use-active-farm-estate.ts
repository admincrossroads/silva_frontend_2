"use client";

import { useEffect } from "react";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useActiveFarmEstate() {
  const activeProgram = useAuthStore((s) => s.activeProgram);
  const activeFarmEstateId = useWorkspaceStore((s) => s.activeFarmEstateId);
  const setActiveFarmEstateId = useWorkspaceStore((s) => s.setActiveFarmEstateId);
  const resetForProgram = useWorkspaceStore((s) => s.resetForProgram);

  const { data: estates = [], isLoading } = useFarmEstates(
    activeProgram ? { status: "active", enabled: true } : { enabled: false },
  );

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

  return {
    estates,
    activeFarmEstate,
    activeFarmEstateId,
    setActiveFarmEstateId,
    isLoading,
  };
}
