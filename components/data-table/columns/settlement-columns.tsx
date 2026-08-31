"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Settlement } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { TableMoney, TablePrimaryCell } from "../data-table-cells";

export const settlementColumns: ColumnDef<Settlement, unknown>[] = [
  {
    accessorKey: "payee",
    header: "Settlement",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/payments/settlements/${row.original.id}`}
        title={row.original.payee}
        subtitle={row.original.type.replace(/_/g, " ")}
      />
    ),
  },
  {
    accessorKey: "amountEtb",
    header: "Amount",
    cell: ({ row }) => <TableMoney amount={row.original.amountEtb} currency="ETB" />,
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
      <Link href={`/payments/settlements/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary">
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    ),
  },
];
