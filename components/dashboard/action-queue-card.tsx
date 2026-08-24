"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight, ListTodo } from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import { DashboardPanel, DashboardPanelEmpty, DashboardPanelRow } from "@/components/dashboard/dashboard-panel";
import { HealthBadge } from "@/components/badges/health-badge";
import { Button } from "@/components/ui/button";

type QueueItem = {
  type: string;
  entityId: string;
  label: string;
  href: string;
  health?: string;
  priority: number;
};

type ActionQueueCardProps = {
  title?: string;
  loadingLabel?: string;
  emptyLabel?: string;
};

export function ActionQueueCard({
  title = "Action queue",
  loadingLabel = "Loading queue…",
  emptyLabel = "No pending actions.",
}: ActionQueueCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "action-queues"],
    queryFn: () => dashboardApi.actionQueues(),
  });

  const items: QueueItem[] = data?.items ?? [];

  return (
    <DashboardPanel
      title={title}
      contentClassName="max-h-72 overflow-y-auto divide-y"
      noPadding
    >
      {isLoading ? (
        <DashboardPanelEmpty message={loadingLabel} />
      ) : items.length ? (
        items.map((item) => (
          <DashboardPanelRow key={`${item.type}-${item.entityId}`} href={item.href}>
            <span className="flex-1 min-w-0 truncate">{item.label}</span>
            <div className="flex items-center gap-2 shrink-0">
              {item.health ? <HealthBadge health={item.health} /> : null}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 pointer-events-none" tabIndex={-1}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DashboardPanelRow>
        ))
      ) : (
        <div className="px-4 py-8 text-center">
          <ListTodo className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      )}
      {items.length > 0 ? (
        <div className="border-t px-4 py-2 text-right">
          <Link href="/dashboard" className="text-xs text-primary hover:underline">
            {items.length} open item{items.length !== 1 ? "s" : ""}
          </Link>
        </div>
      ) : null}
    </DashboardPanel>
  );
}
