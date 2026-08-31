"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layers, ShieldCheck, Shield } from "lucide-react";
import { formatEtb } from "@/lib/utils/format";
import { formatBandRange } from "@/lib/utils/compute-band";
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

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-lg font-semibold">Platform configuration</h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Schedule 3 Thresholds
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/governance/bands">Manage bands</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Band</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Min ETB</TableHead>
                <TableHead>Max ETB</TableHead>
                <TableHead>SPX authority</TableHead>
                <TableHead>Asset owner authority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(schedule3Query.data ?? []).map((t) => (
                <TableRow key={t.band}>
                  <TableCell className="font-medium">Band {t.band}</TableCell>
                  <TableCell className="text-sm">{formatBandRange(t)}</TableCell>
                  <TableCell>{formatEtb(t.minValueEtb)}</TableCell>
                  <TableCell>{t.maxValueEtb == null ? "Open" : formatEtb(t.maxValueEtb)}</TableCell>
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
                <TableHead>Minimum ETB</TableHead>
                <TableHead>Beneficiary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(schedule4Query.data ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.party}</TableCell>
                  <TableCell>{r.coverageType}</TableCell>
                  <TableCell>{formatEtb(r.minimumCoverageEtb)}</TableCell>
                  <TableCell>{r.beneficiary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
