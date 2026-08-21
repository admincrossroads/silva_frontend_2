"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Vendor } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import { Eye } from "lucide-react";

export const vendorColumns: ColumnDef<Vendor, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category.replace(/_/g, " ")}</span>
    ),
  },
  {
    accessorKey: "servicesProvided",
    header: "Services",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block">{row.original.servicesProvided}</span>
    ),
  },
  {
    accessorKey: "prequalified",
    header: "Prequalified",
    cell: ({ row }) => (
      <Badge variant={row.original.prequalified ? "default" : "secondary"}>
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
        <span className="text-xs">
          Expires {row.original.insuranceExpiry ? formatDate(row.original.insuranceExpiry) : "N/A"}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">None</span>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/vendors/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
