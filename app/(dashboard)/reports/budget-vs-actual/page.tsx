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
import { ModulePageShell } from "@/components/items/module-page-shell";
import { BoardView } from "@/components/items/board-view";
import { BVA_HEALTH_COLUMNS, bvaToBoardItem } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import type { BudgetVsActualRow } from "@/types";

export default function BudgetVsActualPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(2026));
  const [view, setView] = useState<ModuleViewMode>("board");

  const { data: rows = [], isLoading } = useQuery<BudgetVsActualRow[]>({
    queryKey: ["bva", year],
    queryFn: () => dashboardApi.budgetVsActual(Number(year)),
  });

  const boardItems = rows.map(bvaToBoardItem);
  const chartRows = rows.map((row) => ({
    discipline: row.activity,
    budgetEtb: row.budgetAllocatedEtb,
    plannedEtb: row.plannedEtb ?? row.budgetAllocatedEtb,
    actualEtb: row.actualEtb,
    committedEtb: row.committedEtb,
  }));

  return (
    <ModulePageShell
      moduleId="cost_management"
      view={view}
      onViewChange={setView}
      filters={
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
      }
    >
      {view === "board" ? (
        <BoardView
          columns={BVA_HEALTH_COLUMNS}
          items={boardItems}
          loading={isLoading}
          emptyMessage={`No budget lines for ${year}.`}
        />
      ) : (
        <>
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
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k ETB`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="budgetEtb" name="Budget" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="plannedEtb" name="Planned" fill="#047857" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="committedEtb" name="Committed" fill="#34d399" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actualEtb" name="Actual" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {rows.length > 0 && (
            <Card className="mt-4">
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>AFP line</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Planned</TableHead>
                      <TableHead className="text-right">Committed</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.afpLineId}>
                        <TableCell>{row.activity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.budgetAllocatedEtb)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.plannedEtb ?? row.budgetAllocatedEtb)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.committedEtb)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.actualEtb)}</TableCell>
                        <TableCell className="text-right">{row.utilizationPercent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </ModulePageShell>
  );
}
