"use client";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";
import { boardColumnTheme } from "@/lib/items/board-theme";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  searchKey?: string;
  filterOptions?: { label: string; value: string }[];
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
  getRowStatus?: (row: T) => string | undefined;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  searchKey,
  filterOptions,
  emptyMessage = "No results found",
  emptyAction,
  getRowStatus,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: searchKey
      ? (row, _columnId, filterValue) => {
          const value = String((row.original as Record<string, unknown>)[searchKey] ?? "").toLowerCase();
          return value.includes(String(filterValue).toLowerCase());
        }
      : "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div className={cn("space-y-3", className)}>
      <Card className="overflow-hidden rounded-2xl border-border/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/25 px-4 py-3">
          <DataTableToolbar
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            filterOptions={filterOptions}
          />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{filteredCount}</span>{" "}
            {filteredCount === 1 ? "row" : "rows"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border/80 bg-muted/40">
                  {getRowStatus ? <th className="w-2 p-0" aria-hidden /> : null}
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (
                          header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-primary" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => {
                  const status = getRowStatus?.(row.original);
                  const stripe = status ? boardColumnTheme(status).dot : "bg-transparent";

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "group relative border-b border-border/50 transition-colors last:border-0",
                        index % 2 === 0 ? "bg-background" : "bg-muted/15",
                        "hover:bg-primary/[0.04]",
                      )}
                    >
                      {getRowStatus ? (
                        <td className="relative w-1.5 p-0">
                          <span className={cn("absolute inset-y-2 left-0 w-[3px] rounded-r-full", stripe)} />
                        </td>
                      ) : null}
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2.5 align-middle text-foreground">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (getRowStatus ? 1 : 0)} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Inbox className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search</p>
                      {emptyAction ? (
                        <Button size="sm" className="mt-4" onClick={emptyAction.onClick}>
                          {emptyAction.label}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <DataTablePagination table={table} />
    </div>
  );
}
