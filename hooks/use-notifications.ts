"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import type { NotificationItem } from "@/types";

export function useNotifications(options?: { acknowledged?: boolean }) {
  const qc = useQueryClient();
  const filterKey =
    options?.acknowledged === false ? "unread" : options?.acknowledged === true ? "read" : "all";

  const query = useQuery<NotificationItem[]>({
    queryKey: ["notifications", filterKey],
    queryFn: () =>
      platformApi.listNotifications(
        options?.acknowledged === undefined
          ? undefined
          : { acknowledged: options.acknowledged ? "true" : "false" },
      ),
    refetchInterval: options?.acknowledged === false ? 30_000 : undefined,
  });

  const acknowledge = useMutation({
    mutationFn: (id: string) => platformApi.acknowledgeNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const acknowledgeAll = useMutation({
    mutationFn: () => platformApi.acknowledgeAllNotifications(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return { ...query, acknowledge, acknowledgeAll };
}
