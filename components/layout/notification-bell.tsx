"use client";

import { Bell } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import type { NotificationItem } from "@/types";

export function NotificationBell() {
  const qc = useQueryClient();
  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ["notifications", "unread"],
    queryFn: () => platformApi.listNotifications({ acknowledged: "false" }),
    refetchInterval: 60_000,
  });

  const ack = useMutation({
    mutationFn: (id: string) => platformApi.acknowledgeNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const count = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-medium">Notifications</div>
        {count === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">No new notifications</p>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <button
              key={n.id}
              type="button"
              className="w-full px-2 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
              onClick={() => ack.mutate(n.id)}
            >
              <p>{n.message}</p>
              <span className="text-xs text-muted-foreground">{new Date(n.sentAt).toLocaleString()}</span>
            </button>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
