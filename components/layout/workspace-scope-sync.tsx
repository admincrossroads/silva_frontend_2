"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace-store";

/**
 * Refetches scoped server data when the user switches farm area in the navbar.
 */
export function WorkspaceScopeSync() {
  const queryClient = useQueryClient();
  const activeFarmEstateId = useWorkspaceStore((s) => s.activeFarmEstateId);
  const prevId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevId.current === undefined) {
      prevId.current = activeFarmEstateId;
      return;
    }
    if (prevId.current === activeFarmEstateId) return;
    prevId.current = activeFarmEstateId;
    void queryClient.invalidateQueries();
  }, [activeFarmEstateId, queryClient]);

  return null;
}
