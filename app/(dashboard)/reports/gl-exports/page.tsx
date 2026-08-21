"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";

type GlExport = {
  id: string;
  period: string;
  status: string;
  createdAt: string;
  restrictedAccessTokenIssued?: boolean;
};

type GlDetail = GlExport & {
  rows?: Array<{
    date: string;
    account: string;
    debitEtb: number;
    creditEtb: number;
    memo: string;
  }>;
};

export default function GlExportsPage() {
  const qc = useQueryClient();
  const [period, setPeriod] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState("");

  const { data: exports = [], isLoading } = useQuery<GlExport[]>({
    queryKey: ["gl-exports"],
    queryFn: () => platformApi.listGlExports(),
  });

  const detailQuery = useQuery<GlDetail>({
    queryKey: ["gl-export", selectedId],
    queryFn: () => platformApi.getGlExport(selectedId),
    enabled: Boolean(selectedId),
  });

  const generate = useMutation({
    mutationFn: () => platformApi.generateGlExport({ period }),
    onSuccess: (row) => {
      setPeriod("");
      setError("");
      setSelectedId(row.id);
      qc.invalidateQueries({ queryKey: ["gl-exports"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not generate export")),
  });

  const detail = detailQuery.data;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">GL journal exports</h1>
        <p className="text-sm text-muted-foreground">
          Generate period exports for SPX restricted accounting credentials.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate by period</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Period (YYYY-MM)"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="2026-03"
            className="sm:w-48"
          />
          <Button
            disabled={!/^\d{4}-\d{2}$/.test(period) || generate.isPending}
            onClick={() => generate.mutate()}
          >
            Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : exports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exports yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((ex) => (
                  <TableRow key={ex.id} className={selectedId === ex.id ? "bg-muted/40" : undefined}>
                    <TableCell className="font-medium">{ex.period}</TableCell>
                    <TableCell>
                      <StatusBadge status={ex.status} />
                    </TableCell>
                    <TableCell>{formatDate(ex.createdAt)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedId(ex.id)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {detailQuery.isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : detail ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">ID </span>
                    <span className="font-mono text-xs">{detail.id}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Period </span>
                    {detail.period}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status</span>
                    {detail.status ? <StatusBadge status={detail.status} /> : "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Restricted token issued </span>
                    {detail.restrictedAccessTokenIssued ? "Yes" : "No"}
                  </p>
                </div>
                {detail.rows?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Memo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.rows.map((line, i) => (
                        <TableRow key={i}>
                          <TableCell>{line.date}</TableCell>
                          <TableCell>{line.account}</TableCell>
                          <TableCell>{Number(line.debitEtb).toLocaleString()}</TableCell>
                          <TableCell>{Number(line.creditEtb).toLocaleString()}</TableCell>
                          <TableCell>{line.memo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    Line detail is available via restricted export credential when issued.
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Unable to load detail.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
