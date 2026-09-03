"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/select-native";

export function useClientPagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize) || 1);
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    setPage(0);
  }, [items, pageSize]);

  const slice = useMemo(
    () => items.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [items, safePage, pageSize],
  );

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    slice,
    total: items.length,
  };
}

interface SimplePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function SimplePagination({
  page,
  pageSize,
  total,
  pageCount,
  onPageChange,
  onPageSizeChange,
  className,
}: SimplePaginationProps) {
  if (total === 0) return null;
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2 text-sm ${className ?? ""}`}>
      <span className="text-muted-foreground">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <NativeSelect
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 w-auto px-2 text-xs"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </NativeSelect>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[3.5rem] text-center text-xs tabular-nums">
          {page + 1} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
