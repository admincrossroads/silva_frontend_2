"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Afp } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatUsd(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export const afpColumns: ColumnDef<Afp>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => row.original.id.slice(0, 8) },
  { accessorKey: "year", header: "Year" },
  { accessorKey: "operatingDiscipline", header: "Discipline" },
  { accessorKey: "activity", header: "Activity" },
  {
    accessorKey: "budgetAllocatedUsd",
    header: "Budget",
    cell: ({ row }) => formatUsd(row.original.budgetAllocatedUsd),
  },
  { accessorKey: "kpiTarget", header: "KPI Target" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const afp = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/planning/afp/${afp.id}`}>View</Link>
            </DropdownMenuItem>
            {afp.status === "draft" && (
              <DropdownMenuItem data-action="submit">Submit</DropdownMenuItem>
            )}
            {afp.status === "submitted" && (
              <DropdownMenuItem data-action="approve">Approve</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
