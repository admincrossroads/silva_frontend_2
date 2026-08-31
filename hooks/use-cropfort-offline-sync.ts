import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { blockFieldTicketsApi } from "@/lib/api/cropfort/block-field-tickets";
import { listQueuedTickets, removeQueuedTicket } from "@/lib/offline/cropfort-queue";

const SYNC_INTERVAL_MS = 120_000;

export function useCropfortOfflineSync() {
  const qc = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const refreshCount = useCallback(async () => {
    const items = await listQueuedTickets();
    setPendingCount(items.length);
  }, []);

  const syncNow = useCallback(async () => {
    if (syncing || typeof navigator === "undefined" || !navigator.onLine) return;
    const queue = await listQueuedTickets();
    if (!queue.length) return;

    setSyncing(true);
    try {
      const results = await blockFieldTicketsApi.sync(
        queue.map(({ queuedAt: _q, ...ticket }) => ticket),
      );
      for (const result of results) {
        if (result.status === "created" || result.status === "already_synced") {
          await removeQueuedTicket(result.clientLocalId);
        }
      }
      setLastSyncAt(new Date().toISOString());
      await refreshCount();
      qc.invalidateQueries({ queryKey: ["block-field-tickets"] });
    } finally {
      setSyncing(false);
    }
  }, [qc, refreshCount, syncing]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    const onOnline = () => syncNow();
    window.addEventListener("online", onOnline);
    const timer = window.setInterval(() => syncNow(), SYNC_INTERVAL_MS);
    return () => {
      window.removeEventListener("online", onOnline);
      window.clearInterval(timer);
    };
  }, [syncNow]);

  return {
    pendingCount,
    syncing,
    lastSyncAt,
    syncNow,
    refreshCount,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  };
}
