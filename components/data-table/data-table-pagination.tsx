import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/select-native";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<T> {
  table: Table<T>;
}

export function DataTablePagination<T>({ table }: DataTablePaginationProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const from = total > 0 ? pageIndex * pageSize + 1 : 0;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">
        Showing{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold tabular-nums text-foreground">{total}</span>
      </span>

      <div className="flex items-center gap-2">
        <NativeSelect
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="h-8 rounded-lg border-border/80 bg-background px-2.5 text-xs shadow-sm"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </NativeSelect>

        <div className="flex items-center rounded-lg border border-border/80 bg-background shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none rounded-l-lg"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[4.5rem] border-x border-border/80 px-3 text-center text-xs font-semibold tabular-nums text-foreground">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-none rounded-r-lg")}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
