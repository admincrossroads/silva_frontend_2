"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { PaymentRequest } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { TableChip, TableIdLink, TableMoney, TablePrimaryCell } from "../data-table-cells";

export const paymentRequestColumns: ColumnDef<PaymentRequest, unknown>[] = [
  {
    accessorKey: "type",
    header: "Payment",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/payments/payment-requests/${row.original.id}`}
        title={row.original.type.replace(/_/g, " ")}
        subtitle={`WO ${row.original.workOrderId.slice(0, 8)}`}
      />
    ),
  },
  {
    accessorKey: "fieldTicketId",
    header: "Field ticket",
    cell: ({ row }) => (
      <TableIdLink href={`/execution/field-tickets/${row.original.fieldTicketId}`} id={row.original.fieldTicketId} />
    ),
  },
  {
    accessorKey: "amountRequestedEtb",
    header: "Amount",
    cell: ({ row }) => <TableMoney amount={row.original.amountRequestedEtb} currency="ETB" />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link href={`/payments/payment-requests/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary">
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    ),
  },
];
