"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Vendor } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { ArrowUpRight } from "lucide-react";
import { TableChip, TableMuted, TablePrimaryCell } from "../data-table-cells";

export const vendorColumns: ColumnDef<Vendor, unknown>[] = [
  {
    accessorKey: "name",
    header: "Vendor",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/vendors/${row.original.id}`}
        title={row.original.name}
        subtitle={row.original.category.replace(/_/g, " ")}
      />
    ),
  },
  {
    accessorKey: "servicesProvided",
    header: "Services",
    cell: ({ row }) => (
      <TableMuted className="line-clamp-2 block max-w-[14rem]">
        {row.original.servicesProvided || "—"}
      </TableMuted>
    ),
  },
  {
    accessorKey: "prequalified",
    header: "Prequalified",
    cell: ({ row }) => (
      <Badge variant={row.original.prequalified ? "default" : "secondary"} className="text-[11px]">
        {row.original.prequalified ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "insuranceExpiry",
    header: "Insurance",
    cell: ({ row }) =>
      row.original.insuranceOnFile ? (
        <TableChip>Exp. {row.original.insuranceExpiry ? formatDate(row.original.insuranceExpiry) : "N/A"}</TableChip>
      ) : (
        <span className="text-sm text-muted-foreground">None</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link href={`/vendors/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary">
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    ),
  },
];
