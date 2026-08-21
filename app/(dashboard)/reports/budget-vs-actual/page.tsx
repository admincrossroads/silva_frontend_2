"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { dashboardApi } from "@/lib/api/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import type { BudgetVsActualRow } from "@/types";

export default function BudgetVsActualPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(2026));

  const { data: rows = [], isLoading } = useQuery<BudgetVsActualRow[]>({
    queryKey: ["bva", year],
    queryFn: () => dashboardApi.budgetVsActual(Number(year)),
  });

  const chartRows = rows.map((row) => ({
    discipline: row.activity,
    budgetUsd: row.budgetAllocatedUsd,
    actualUsd: row.actualUsd,
    committedUsd: row.committedUsd,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget vs Actual</h1>
          <p className="text-sm text-muted-foreground">Compare budgeted spend against actuals by AFP line</p>
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {[2026, currentYear, currentYear - 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>By AFP line</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : chartRows.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">No data for {year}.</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartRows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="discipline" />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="budgetUsd" name="Budget" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="committedUsd" name="Committed" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualUsd" name="Actual" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AFP line</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Committed</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.afpLineId}>
                    <TableCell>{row.activity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.budgetAllocatedUsd)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.committedUsd)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.actualUsd)}</TableCell>
                    <TableCell className="text-right">{row.utilizationPercent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
