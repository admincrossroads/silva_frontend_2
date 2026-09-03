"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [showAll, setShowAll] = useState(false);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["farm-benchmarks", farmId] });
    await qc.invalidateQueries({ queryKey: ["farm-workflow", farmId] });
  };

  const importSurveys = useMutation({
    mutationFn: () => farmPlatformApi.importBenchmarkSurveys(farmId),
    meta: {
      successMessage: "Benchmark surveys imported from workbook",
      errorMessage: "Could not import benchmark surveys",
    },
    onSuccess: refresh,
  });

  const approve = useMutation({
    mutationFn: (surveyId: string) => farmPlatformApi.approveBenchmarkSurvey(surveyId),
    meta: { successMessage: "Survey approved", errorMessage: "Could not approve survey" },
    onSuccess: refresh,
  });

  const submit = useMutation({
    mutationFn: (surveyId: string) => farmPlatformApi.submitBenchmarkSurvey(surveyId),
    meta: { successMessage: "Survey submitted", errorMessage: "Could not submit survey" },
    onSuccess: refresh,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading benchmark surveys…</p>;
  }

  const approved = surveys.filter((s) => s.status === "approved" && !s.useNormWage);
  const normWage = surveys.filter((s) => s.useNormWage);
  const pending = surveys.filter((s) => s.status !== "approved");
  const visible = showAll ? surveys : surveys.slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{approved.length} approved</Badge>
        <Badge variant="secondary">{normWage.length} norm × wage</Badge>
        {pending.length ? <Badge variant="outline">{pending.length} pending</Badge> : null}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          disabled={importSurveys.isPending}
          onClick={() => importSurveys.mutate()}
        >
          {importSurveys.isPending ? "Importing…" : "Import from workbook"}
        </Button>
      </div>

      {!surveys.length ? (
        <p className="text-sm text-muted-foreground">
          No surveys yet. Import the Chaka Buna workbook to load neighbor-farm rates for every Tier 1
          activity, then approve or override them. Activities with no survey data are flagged
          norm × wage.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Neighbor 1</TableHead>
                <TableHead>Neighbor 2</TableHead>
                <TableHead>Recommended</TableHead>
                <TableHead>Proposed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((s) => (
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
                      <Badge variant="outline">norm × wage</Badge>
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

          {surveys.length > 12 ? (
            <Button size="sm" variant="ghost" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show fewer" : `Show all ${surveys.length}`}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
