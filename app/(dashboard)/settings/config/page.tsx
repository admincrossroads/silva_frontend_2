"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { dashboardApi } from "@/lib/api/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Layers, ShieldCheck, Shield } from "lucide-react";
import type { AccountabilityRow, Schedule3Threshold, Schedule4Rule } from "@/types";

export default function ConfigPage() {
  const schedule3Query = useQuery<Schedule3Threshold[]>({
    queryKey: ["schedule3"],
    queryFn: () => platformApi.listSchedule3(),
  });
  const schedule4Query = useQuery<Schedule4Rule[]>({
    queryKey: ["schedule4"],
    queryFn: () => platformApi.listSchedule4(),
  });
  const matrixQuery = useQuery<AccountabilityRow[]>({
    queryKey: ["accountability"],
    queryFn: () => platformApi.listAccountabilityMatrix(),
  });
  const summaryQuery = useQuery({
    queryKey: ["bva-summary", 2026],
    queryFn: () => dashboardApi.budgetVsActualSummary(2026),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <section className="space-y-1">
        <h2 className="text-lg font-semibold">Platform configuration</h2>
        <p className="text-sm text-muted-foreground">
          Live Schedule 3 / Schedule 4 thresholds and accountability matrix from the API.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> FX Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">USD / ETB Exchange Rate</span>
            <span className="text-lg font-bold">{summaryQuery.data?.fxRateEtbPerUsd ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Schedule 3 Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Band</TableHead>
                <TableHead>Min USD</TableHead>
                <TableHead>Max USD</TableHead>
                <TableHead>SPX authority</TableHead>
                <TableHead>Silva authority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(schedule3Query.data ?? []).map((t) => (
                <TableRow key={t.band}>
                  <TableCell className="font-medium">Band {t.band}</TableCell>
                  <TableCell>${t.minValueUsd.toLocaleString()}</TableCell>
                  <TableCell>{t.maxValueUsd == null ? "Open" : `$${t.maxValueUsd.toLocaleString()}`}</TableCell>
                  <TableCell>{t.spxAuthority}</TableCell>
                  <TableCell>{t.silvaAuthority}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Schedule 4 Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Party</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Minimum USD</TableHead>
                <TableHead>Beneficiary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(schedule4Query.data ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.party}</TableCell>
                  <TableCell>{r.coverageType}</TableCell>
                  <TableCell>${Number(r.minimumCoverageUsd).toLocaleString()}</TableCell>
                  <TableCell>{r.beneficiary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-3">
            Certificates must be on file before Work Orders issue; renew by 14 days before expiry or work stops.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Accountability Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discipline</TableHead>
                <TableHead>Execute</TableHead>
                <TableHead>Validate</TableHead>
                <TableHead>Decide</TableHead>
                <TableHead>Author</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(matrixQuery.data ?? []).map((row) => (
                <TableRow key={row.operatingDiscipline}>
                  <TableCell className="font-medium">{row.operatingDiscipline}</TableCell>
                  <TableCell>{row.executeRole}</TableCell>
                  <TableCell>{row.validateRole}</TableCell>
                  <TableCell>{row.decideRole}</TableCell>
                  <TableCell>{row.authorRole}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
