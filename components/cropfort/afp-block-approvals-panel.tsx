"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  useAfpBlockLines,
  useApproveAfpBlockLine,
  useReturnAfpBlockLine,
} from "@/hooks/use-afp-blocks";

export function AfpBlockApprovalsPanel() {
  const year = new Date().getUTCFullYear();
  const { data: lines = [], isLoading } = useAfpBlockLines({ planYear: year, status: "submitted" });
  const approve = useApproveAfpBlockLine();
  const returnLine = useReturnAfpBlockLine();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});

  return (
    <DashboardPanel title="Block AFP approvals" viewAllHref="/operations/interventions?tab=block-afp">
      <Card className="overflow-hidden border-0 shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Block / activity</th>
              <th className="px-4 py-2 font-medium">Qty</th>
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
                  No submitted block AFP lines.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{line.block?.code ?? line.blockId}</p>
                    <p className="text-xs text-muted-foreground">{line.activity?.name ?? line.activityId}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{line.plannedQty}</td>
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
                        id={`afp-return-${line.id}`}
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
