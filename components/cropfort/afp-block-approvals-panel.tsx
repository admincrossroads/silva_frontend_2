"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  useAfpBlockLines,
  useApproveAfpBlockLine,
  useReturnAfpBlockLine,
} from "@/hooks/use-afp-blocks";

/** Compact Silva dashboard queue — full plan at /planning/afp */
export function AfpBlockApprovalsPanel() {
  const year = new Date().getUTCFullYear();
  const { data: lines = [], isLoading } = useAfpBlockLines({ planYear: year, status: "submitted" });
  const approve = useApproveAfpBlockLine();
  const returnLine = useReturnAfpBlockLine();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});
  const preview = lines.slice(0, 5);

  return (
    <DashboardPanel title="Annual plan approvals" viewAllHref="/planning/afp">
      {isLoading ? (
        <p className="px-1 py-4 text-sm text-muted-foreground">Loading…</p>
      ) : preview.length === 0 ? (
        <p className="px-1 py-4 text-sm text-muted-foreground">No submitted plan lines.</p>
      ) : (
        <ul className="divide-y">
          {preview.map((line) => (
            <li key={line.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{line.block?.code ?? line.blockId}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.activity?.name ?? line.activityId} · qty {line.plannedQty}
                  </p>
                </div>
                {line.electionStatus === "elected" ? (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
                    Elected
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  size="sm"
                  disabled={approve.isPending}
                  onClick={() => approve.mutate({ lineId: line.id })}
                >
                  Approve
                </Button>
                <Input
                  id={`dash-afp-return-${line.id}`}
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
            </li>
          ))}
        </ul>
      )}
      {lines.length > 5 ? (
        <p className="mt-2 text-xs text-muted-foreground">+{lines.length - 5} more on Annual plan</p>
      ) : null}
    </DashboardPanel>
  );
}
