"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Settlement } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const settlementColumns: ColumnDef<Settlement, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: "workOrderId",
    header: "Work Order",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.workOrderId.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: "paymentRequestId",
    header: "Payment Req",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.paymentRequestId.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.type.replace(/_/g, " ")}</span>
    ),
  },
  {
    accessorKey: "payee",
    header: "Payee",
  },
  {
    accessorKey: "amountEtb",
    header: "Amount (ETB)",
    cell: ({ row }) => formatCurrency(row.original.amountEtb, "ETB"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/payments/settlements/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
