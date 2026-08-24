"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CheckCheck,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, PageFilters, PageContent } from "@/components/layout/page-shell";
import { useNotifications } from "@/hooks/use-notifications";
import {
  notificationEntityHref,
  notificationEntityLabel,
  notificationTriggerLabel,
} from "@/lib/notifications/entity-links";
import type { NotificationItem } from "@/types";

type FilterValue = "all" | "unread" | "read";

function filterToOptions(filter: FilterValue) {
  if (filter === "unread") return { acknowledged: false as const };
  if (filter === "read") return { acknowledged: true as const };
  return undefined;
}

function entityIcon(entityType: string) {
  switch (entityType) {
    case "afp_line":
      return FileText;
    case "afe":
      return FileCheck;
    case "work_order":
    case "field_ticket":
      return ClipboardList;
    case "payment_request":
    case "owner_settlement":
      return CreditCard;
    case "report":
      return BarChart3;
    default:
      return Bell;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [error, setError] = useState("");

  const { data: items = [], isLoading, acknowledge, acknowledgeAll } = useNotifications(
    filterToOptions(filter),
  );

  const unreadCount = useMemo(() => items.filter((n) => !n.acknowledged).length, [items]);

  const handleAcknowledge = (id: string) => {
    acknowledge.mutate(id, {
      onSuccess: () => setError(""),
      onError: (err) => setError(getApiErrorMessage(err, "Could not acknowledge")),
    });
  };

  const handleAcknowledgeAll = () => {
    const unreadIds = items.filter((n) => !n.acknowledged).map((n) => n.id);
    if (!unreadIds.length) return;
    acknowledgeAll.mutate(unreadIds, {
      onSuccess: () => setError(""),
      onError: (err) => setError(getApiErrorMessage(err, "Could not mark all as read")),
    });
  };

  const openNotification = (n: NotificationItem) => {
    const href = notificationEntityHref(n.entityType, n.entityId);
    if (!n.acknowledged) handleAcknowledge(n.id);
    if (href) router.push(href);
  };

  const emptyMessage =
    filter === "unread"
      ? "You're all caught up — no unread notifications."
      : filter === "read"
        ? "No acknowledged notifications yet."
        : "No notifications yet. Actions across work orders, field tickets, payments, and reports will appear here.";

  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        title="Notifications"
        description="Workflow alerts across planning, execution, payments, and reporting."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              disabled={acknowledgeAll.isPending}
              onClick={handleAcknowledgeAll}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              {acknowledgeAll.isPending ? "Marking…" : `Mark all read (${unreadCount})`}
            </Button>
          ) : undefined
        }
      />

      <PageFilters>
        <Select
          label="Show"
          className="w-44"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </Select>
      </PageFilters>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <PageContent>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>Event</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((n) => {
                      const href = notificationEntityHref(n.entityType, n.entityId);
                      const Icon = entityIcon(n.entityType);
                      return (
                        <TableRow
                          key={n.id}
                          className={cn(
                            href && "cursor-pointer",
                            !n.acknowledged && "bg-primary/[0.03]",
                          )}
                          onClick={() => {
                            if (href) openNotification(n);
                          }}
                        >
                          <TableCell>
                            {!n.acknowledged ? (
                              <span
                                className="inline-block h-2 w-2 rounded-full bg-primary"
                                title="Unread"
                              />
                            ) : (
                              <span className="inline-block h-2 w-2 rounded-full bg-transparent" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium leading-snug">
                                {notificationTriggerLabel(n.triggerType)}
                              </p>
                              {!n.acknowledged ? (
                                <Badge variant="outline" className="text-[10px]">
                                  New
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Read</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[280px]">
                            <p className="truncate text-sm text-muted-foreground" title={n.message}>
                              {n.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium">
                                  {notificationEntityLabel(n.entityType)}
                                </p>
                                <p className="truncate font-mono text-[10px] text-muted-foreground">
                                  {n.entityId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDateTime(n.sentAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div
                              className="flex flex-wrap justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!n.acknowledged ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={acknowledge.isPending}
                                  onClick={() => handleAcknowledge(n.id)}
                                >
                                  Mark read
                                </Button>
                              ) : null}
                              {href ? (
                                <Button size="sm" variant="secondary" asChild>
                                  <Link href={href}>
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Open
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageShell>
  );
}
