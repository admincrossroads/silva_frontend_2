"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { NotificationItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { useState } from "react";

function entityHref(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "afp_line":
      return `/planning/afp/${entityId}`;
    case "afe":
      return `/planning/afe/${entityId}`;
    case "work_order":
      return `/execution/work-orders/${entityId}`;
    case "field_ticket":
      return `/execution/field-tickets/${entityId}`;
    case "payment_request":
      return `/payments/payment-requests/${entityId}`;
    case "report":
      return `/reports/workspace`;
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [error, setError] = useState("");

  const { data: items = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: () => platformApi.listNotifications(),
  });

  const ack = useMutation({
    mutationFn: (id: string) => platformApi.acknowledgeNotification(id),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not acknowledge")),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Program alerts for your role. Acknowledge when handled.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No notifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const href = entityHref(n.entityType, n.entityId);
            return (
              <Card key={n.id} className={n.acknowledged ? "opacity-70" : undefined}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base">{n.triggerType}</CardTitle>
                    <p className="text-xs text-muted-foreground">{formatDate(n.sentAt)}</p>
                  </div>
                  {!n.acknowledged ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={ack.isPending}
                      onClick={() => ack.mutate(n.id)}
                    >
                      Acknowledge
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Acknowledged</span>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{n.message}</p>
                  {href ? (
                    <Link href={href} className="text-primary hover:underline text-xs font-medium">
                      Open {n.entityType} →
                    </Link>
                  ) : n.entityType ? (
                    <p className="text-xs text-muted-foreground font-mono">
                      {n.entityType}/{n.entityId}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
