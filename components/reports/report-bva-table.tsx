"use client";

import type { BudgetVsActualRow } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import { StatusBadge } from "@/components/badges/status-badge";

interface ReportBvaTableProps {
  rows: BudgetVsActualRow[];
}

export function ReportBvaTable({ rows }: ReportBvaTableProps) {
  if (!rows.length) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No budget vs actual lines were captured in this report snapshot.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead className="text-right">Budget</TableHead>
            <TableHead className="text-right">Committed</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead className="text-right">Utilization</TableHead>
            <TableHead>Health</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.afpLineId}>
              <TableCell className="font-medium">{row.activity}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(row.budgetAllocatedUsd)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(row.committedUsd)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(row.actualUsd)}</TableCell>
              <TableCell className="text-right tabular-nums">{row.utilizationPercent}%</TableCell>
              <TableCell>
                <StatusBadge status={row.health} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
