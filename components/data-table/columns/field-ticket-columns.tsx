"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { FieldTicket } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
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
import { formatDate } from "@/lib/utils/format";
import {
  TableChip,
  TableIdLink,
  TablePrimaryCell,
  TableRowActionsTrigger,
} from "../data-table-cells";

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
        <TableRowActionsTrigger disabled={busy} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/execution/field-tickets/${ft.id}`}>View details</Link>
        </DropdownMenuItem>
        {ft.status === "draft" ? (
          <DropdownMenuItem onClick={() => run(() => submit.mutateAsync(ft.id))}>Submit</DropdownMenuItem>
        ) : null}
        {ft.status === "submitted" ? (
          <>
            <DropdownMenuItem onClick={() => run(() => review.mutateAsync(ft.id))}>Vendor review</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => run(() => reject.mutateAsync({ id: ft.id, reason: "Rejected from register" }))}
            >
              Reject
            </DropdownMenuItem>
          </>
        ) : null}
        {ft.status === "vendor_reviewed" ? (
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
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const fieldTicketColumns: ColumnDef<FieldTicket>[] = [
  {
    accessorKey: "activityRecorded",
    header: "Activity",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/execution/field-tickets/${row.original.id}`}
        title={row.original.activityRecorded}
        subtitle={formatDate(row.original.ticketDate)}
      />
    ),
  },
  {
    accessorKey: "workOrderId",
    header: "Work order",
    cell: ({ row }) => (
      <TableIdLink href={`/execution/work-orders/${row.original.workOrderId}`} id={row.original.workOrderId} />
    ),
  },
  {
    accessorKey: "areaHa",
    header: "Area",
    cell: ({ row }) => <TableChip>{row.original.areaHa.toFixed(2)} ha</TableChip>,
  },
  {
    accessorKey: "laborCount",
    header: "Labor",
    cell: ({ row }) => <span className="text-sm font-semibold tabular-nums">{row.original.laborCount}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <FtRowActions ft={row.original} />,
  },
];
