"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FieldTicket } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useRejectFieldTicket,
  useSubmitFieldTicket,
  useValidateFieldTicket,
  useVendorReviewFieldTicket,
} from "@/hooks/use-field-tickets";
import { getApiErrorMessage } from "@/lib/api/errors";

function FtRowActions({ ft }: { ft: FieldTicket }) {
  const submit = useSubmitFieldTicket();
  const review = useVendorReviewFieldTicket();
  const validate = useValidateFieldTicket();
  const reject = useRejectFieldTicket();
  const busy = submit.isPending || review.isPending || validate.isPending || reject.isPending;

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
          <Link href={`/execution/field-tickets/${ft.id}`}>View</Link>
        </DropdownMenuItem>
        {ft.status === "draft" && (
          <DropdownMenuItem onClick={() => run(() => submit.mutateAsync(ft.id))}>Submit</DropdownMenuItem>
        )}
        {ft.status === "submitted" && (
          <>
            <DropdownMenuItem onClick={() => run(() => review.mutateAsync(ft.id))}>Vendor review</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => run(() => reject.mutateAsync({ id: ft.id, reason: "Rejected from register" }))}
            >
              Reject
            </DropdownMenuItem>
          </>
        )}
        {ft.status === "vendor_reviewed" && (
          <>
            <DropdownMenuItem onClick={() => run(() => validate.mutateAsync({ id: ft.id, comment: "" }))}>
              SPX validate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => run(() => reject.mutateAsync({ id: ft.id, reason: "Rejected from register" }))}
            >
              Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const fieldTicketColumns: ColumnDef<FieldTicket>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Link href={`/execution/field-tickets/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "workOrderId",
    header: "Work Order",
    cell: ({ row }) => (
      <Link href={`/execution/work-orders/${row.original.workOrderId}`} className="font-mono text-xs hover:underline">
        {row.original.workOrderId}
      </Link>
    ),
  },
  { accessorKey: "activityRecorded", header: "Activity" },
  {
    accessorKey: "areaHa",
    header: "Area (ha)",
    cell: ({ row }) => row.original.areaHa.toFixed(2),
  },
  { accessorKey: "laborCount", header: "Labor" },
  {
    accessorKey: "ticketDate",
    header: "Date",
    cell: ({ row }) => new Date(row.original.ticketDate).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <FtRowActions ft={row.original} />,
  },
];
