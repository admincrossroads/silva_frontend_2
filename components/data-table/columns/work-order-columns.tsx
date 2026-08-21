"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { WorkOrder } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCompleteWorkOrder,
  useIssueWorkOrder,
  useStartWorkOrder,
} from "@/hooks/use-work-orders";
import { getApiErrorMessage } from "@/lib/api/errors";

function WoRowActions({ wo }: { wo: WorkOrder }) {
  const issue = useIssueWorkOrder();
  const start = useStartWorkOrder();
  const complete = useCompleteWorkOrder();
  const busy = issue.isPending || start.isPending || complete.isPending;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (err) {
      window.alert(getApiErrorMessage(err, "Action failed"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={busy}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/execution/work-orders/${wo.id}`}>View</Link>
        </DropdownMenuItem>
        {wo.status === "draft" && (
          <DropdownMenuItem onClick={() => run(() => issue.mutateAsync({ id: wo.id, comment: "" }))}>
            Issue
          </DropdownMenuItem>
        )}
        {wo.status === "issued" && (
          <DropdownMenuItem onClick={() => run(() => start.mutateAsync(wo.id))}>Start</DropdownMenuItem>
        )}
        {wo.status === "in_progress" && (
          <DropdownMenuItem onClick={() => run(() => complete.mutateAsync(wo.id))}>Complete</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const workOrderColumns: ColumnDef<WorkOrder>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Link href={`/execution/work-orders/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
        {row.original.id}
      </Link>
    ),
  },
  { accessorKey: "afeId", header: "AFE" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "activity", header: "Activity" },
  { accessorKey: "tier", header: "Tier" },
  {
    id: "weeks",
    header: "Weeks",
    cell: ({ row }) => `W${row.original.weekStart}–W${row.original.weekEnd}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <WoRowActions wo={row.original} />,
  },
];
