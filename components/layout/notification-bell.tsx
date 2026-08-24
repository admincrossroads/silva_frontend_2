"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import {
  notificationEntityHref,
  notificationEntityLabel,
  notificationTriggerLabel,
} from "@/lib/notifications/entity-links";

export function NotificationBell() {
  const { data: notifications = [], acknowledge } = useNotifications({ acknowledged: false });
  const count = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {count > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          <Link href="/notifications" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {count === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">No new notifications</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((n) => {
              const href = notificationEntityHref(n.entityType, n.entityId);
              return (
                <div key={n.id} className="border-b px-3 py-3 last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary">{notificationTriggerLabel(n.triggerType)}</p>
                      <p className="mt-1 text-sm leading-snug">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(n.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 px-2 text-xs"
                      disabled={acknowledge.isPending}
                      onClick={() => acknowledge.mutate(n.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                  {href ? (
                    <Link href={href} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                      Open {notificationEntityLabel(n.entityType)} →
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
