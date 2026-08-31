"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Afp } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableChip, TableMoney, TableMuted, TablePrimaryCell, TableRowActionsTrigger } from "../data-table-cells";

export const afpColumns: ColumnDef<Afp>[] = [
  {
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/planning/afp/${row.original.id}`}
        title={row.original.activity}
        subtitle={row.original.operatingDiscipline}
      />
    ),
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => (
      <div className="w-16">
        <TableChip>{row.original.year}</TableChip>
      </div>
    ),
  },
  {
    accessorKey: "budgetAllocatedEtb",
    header: "Budget",
    cell: ({ row }) => (
      <div className="w-28 whitespace-nowrap">
        <TableMoney amount={row.original.budgetAllocatedEtb} />
      </div>
    ),
  },
  {
    accessorKey: "kpiTarget",
    header: "KPI",
    cell: ({ row }) => (
      <TableMuted className="line-clamp-2 block max-w-[14rem]">
        {row.original.kpiTarget || "—"}
      </TableMuted>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="w-32">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const afp = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TableRowActionsTrigger />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/planning/afp/${afp.id}`}>View details</Link>
            </DropdownMenuItem>
            {afp.status === "draft" ? <DropdownMenuItem>Submit</DropdownMenuItem> : null}
            {afp.status === "submitted" ? <DropdownMenuItem>Approve</DropdownMenuItem> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
