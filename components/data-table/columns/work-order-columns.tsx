"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { WorkOrder } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
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
import { TableChip, TablePrimaryCell, TableRowActionsTrigger } from "../data-table-cells";

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
        <TableRowActionsTrigger disabled={busy} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/execution/work-orders/${wo.id}`}>View details</Link>
        </DropdownMenuItem>
        {wo.status === "draft" ? (
          <DropdownMenuItem onClick={() => run(() => issue.mutateAsync({ id: wo.id, comment: "" }))}>
            Issue
          </DropdownMenuItem>
        ) : null}
        {wo.status === "issued" ? (
          <DropdownMenuItem onClick={() => run(() => start.mutateAsync(wo.id))}>Start</DropdownMenuItem>
        ) : null}
        {wo.status === "in_progress" ? (
          <DropdownMenuItem onClick={() => run(() => complete.mutateAsync(wo.id))}>Complete</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const workOrderColumns: ColumnDef<WorkOrder>[] = [
  {
    accessorKey: "activity",
    header: "Work order",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/execution/work-orders/${row.original.id}`}
        title={row.original.activity}
        subtitle={`${row.original.category} · Tier ${row.original.tier}`}
      />
    ),
  },
  {
    id: "weeks",
    header: "Weeks",
    cell: ({ row }) => (
      <TableChip>
        W{row.original.weekStart}–W{row.original.weekEnd}
      </TableChip>
    ),
  },
  {
    accessorKey: "afeId",
    header: "AFE",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.afeId.slice(0, 10)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <WoRowActions wo={row.original} />,
  },
];
