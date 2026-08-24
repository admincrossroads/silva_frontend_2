"use client";

import { useQuery } from "@tanstack/react-query";
import { activityCatalogApi } from "@/lib/api/activity-catalog";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ActivityCatalogPanelProps = {
  afpLineId: string;
};

function formatEtb(value: number | null) {
  if (value == null) return "—";
  return `${value.toLocaleString()} ETB`;
}

export function ActivityCatalogPanel({ afpLineId }: ActivityCatalogPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-catalog", afpLineId],
    queryFn: () => activityCatalogApi.summaryByAfp(afpLineId),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading B-Agro activity plan…</p>;
  }

  if (!data?.activities.length) {
    return null;
  }

  const scope = data.activities[0]?.scope as { blocks?: string[]; areaHa?: number; trees?: number; seedlings?: number } | null;

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            B-Agro activity plan
          </h3>
          <p className="mt-1 text-sm text-foreground">
            {data.activities[0]?.sectionLabel} · {data.activityCount} activities
          </p>
          {scope ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {scope.blocks?.length ? `Blocks ${scope.blocks.join(", ")}` : null}
              {scope.areaHa ? ` · ${scope.areaHa} ha` : null}
              {scope.trees ? ` · ${scope.trees.toLocaleString()} trees` : null}
              {scope.seedlings ? ` · ${scope.seedlings.toLocaleString()} seedlings` : null}
            </p>
          ) : null}
        </div>
        <div className="text-right text-sm">
          <p className="font-medium tabular-nums">{data.totalMandays.toLocaleString()} mandays</p>
          <p className="text-muted-foreground tabular-nums">{formatEtb(data.totalCostEtb)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">MD</TableHead>
              <TableHead className="text-right">Cost (ETB)</TableHead>
              <TableHead className="text-right">Wage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.activities.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell>
                  <span className="font-medium">{row.nameEn}</span>
                  {row.nameAm ? (
                    <span className="block text-xs text-muted-foreground">{row.nameAm}</span>
                  ) : null}
                </TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.annualQuantity?.toLocaleString() ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.annualMandays?.toLocaleString() ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.annualCostEtb?.toLocaleString() ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.normWageEtb ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
