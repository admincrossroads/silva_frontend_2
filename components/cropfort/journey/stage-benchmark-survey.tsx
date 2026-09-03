"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SimplePagination, useClientPagination } from "@/components/ui/simple-pagination";
import { useFarmBenchmarkSurveys } from "@/hooks/use-farm-workflow";
import { farmPlatformApi } from "@/lib/api/cropfort/farm-platform";

type Props = { farmId: string };

function etb(value?: number | null) {
  if (value == null) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function StageBenchmarkSurvey({ farmId }: Props) {
  const qc = useQueryClient();
  const { data: surveys = [], isLoading } = useFarmBenchmarkSurveys(farmId);
  const pagination = useClientPagination(surveys, 10);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["farm-benchmarks", farmId] });
    await qc.invalidateQueries({ queryKey: ["farm-workflow", farmId] });
  };

  const importSurveys = useMutation({
    mutationFn: () => farmPlatformApi.importBenchmarkSurveys(farmId),
    meta: {
      successMessage: "Benchmarks imported",
      errorMessage: "Could not import benchmarks",
    },
    onSuccess: refresh,
  });

  const approve = useMutation({
    mutationFn: (surveyId: string) => farmPlatformApi.approveBenchmarkSurvey(surveyId),
    meta: { successMessage: "Approved", errorMessage: "Could not approve" },
    onSuccess: refresh,
  });

  const submit = useMutation({
    mutationFn: (surveyId: string) => farmPlatformApi.submitBenchmarkSurvey(surveyId),
    meta: { successMessage: "Submitted", errorMessage: "Could not submit" },
    onSuccess: refresh,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const approved = surveys.filter((s) => s.status === "approved" && !s.useNormWage).length;
  const pending = surveys.filter((s) => s.status !== "approved").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{approved} approved</Badge>
        {pending ? <Badge variant="outline">{pending} pending</Badge> : null}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={importSurveys.isPending}
          onClick={() => importSurveys.mutate()}
        >
          {importSurveys.isPending ? "Importing…" : "Import"}
        </Button>
      </div>

      {!surveys.length ? (
        <p className="text-sm text-muted-foreground">No benchmarks yet.</p>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>N1</TableHead>
                <TableHead>N2</TableHead>
                <TableHead>Rec.</TableHead>
                <TableHead>Proposed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.slice.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.activityCode}
                    <span className="ml-2 font-normal text-muted-foreground">{s.activityName}</span>
                  </TableCell>
                  <TableCell>{etb(s.neighbor1Rate)}</TableCell>
                  <TableCell>{etb(s.neighbor2Rate)}</TableCell>
                  <TableCell>{etb(s.recommendedRate)}</TableCell>
                  <TableCell>{etb(s.proposedRate)}</TableCell>
                  <TableCell>
                    {s.useNormWage ? (
                      <Badge variant="outline">norm×wage</Badge>
                    ) : (
                      <Badge variant={s.status === "approved" ? "secondary" : "outline"}>
                        {s.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap">
                    {s.status === "draft" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submit.isPending}
                        onClick={() => submit.mutate(s.id)}
                      >
                        Submit
                      </Button>
                    ) : null}
                    {s.status === "submitted" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate(s.id)}
                      >
                        Approve
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <SimplePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </Card>
      )}
    </div>
  );
}
