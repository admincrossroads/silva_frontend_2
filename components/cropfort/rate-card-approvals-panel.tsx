"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  useRateCardLines,
  useApproveRateCardLine,
  useReturnRateCardLine,
} from "@/hooks/use-rate-card";

export function RateCardApprovalsPanel() {
  const { data: lines = [], isLoading } = useRateCardLines("submitted");
  const approve = useApproveRateCardLine();
  const returnLine = useReturnRateCardLine();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});

  return (
    <DashboardPanel title="Rate card approvals" viewAllHref="/operations/interventions?tab=rate-card">
      <Card className="overflow-hidden border-0 shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Resource</th>
              <th className="px-4 py-2 font-medium">Rate (ETB)</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : lines.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No submitted rate lines.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{line.resourceName}</p>
                    <p className="text-xs text-muted-foreground">{line.resourceCode}</p>
                    {line.isFlagged ? (
                      <Badge variant="outline" className="mt-1">
                        Flagged
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{line.rateEtb}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate({ lineId: line.id })}
                      >
                        Approve
                      </Button>
                      <Input
                        id={`return-${line.id}`}
                        placeholder="Return comment"
                        value={returnComment[line.id] ?? ""}
                        onChange={(e) =>
                          setReturnComment((prev) => ({ ...prev, [line.id]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={returnLine.isPending || !returnComment[line.id]?.trim()}
                        onClick={() =>
                          returnLine.mutate({
                            lineId: line.id,
                            comment: returnComment[line.id].trim(),
                          })
                        }
                      >
                        Return
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </DashboardPanel>
  );
}
