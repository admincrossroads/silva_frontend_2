"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  useAfpBlockLines,
  useCreateAfpBlockLine,
  useSubmitAfpBlockLines,
  useUpdateAfpBlockElection,
  useReopenAfpBlockLine,
} from "@/hooks/use-afp-blocks";
import { useBudgetPreview } from "@/hooks/use-budget-preview";
import { useVendorFarmEstates } from "@/hooks/use-vendor-farm-estates";
import { useActivityMaster } from "@/hooks/use-activity-master";

export function AfpBlocksPanel() {
  const year = new Date().getUTCFullYear();
  const { data: lines = [], isLoading } = useAfpBlockLines({ planYear: year });
  const { data: budget } = useBudgetPreview({ planYear: year });
  const { estates } = useVendorFarmEstates({ status: "active" });
  const { data: activities = [] } = useActivityMaster();
  const createLine = useCreateAfpBlockLine();
  const submit = useSubmitAfpBlockLines();
  const updateElection = useUpdateAfpBlockElection();
  const reopen = useReopenAfpBlockLine();

  const blocks = estates.flatMap((e) => e.blocks.map((b) => ({ ...b, estateName: e.name })));
  const [blockId, setBlockId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [plannedQty, setPlannedQty] = useState("");

  const draftIds = lines.filter((l) => l.status === "draft").map((l) => l.id);

  const onCreate = async () => {
    if (!blockId || !activityId || !plannedQty) return;
    await createLine.mutateAsync({
      planYear: year,
      blockId,
      activityId,
      plannedQty: Number(plannedQty),
    });
    setPlannedQty("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Block AFP</h2>
          <p className="text-sm text-muted-foreground">Plan block-level activities and elect lines for budget.</p>
        </div>
        <Button
          variant="outline"
          disabled={!draftIds.length || submit.isPending}
          onClick={() => submit.mutate(draftIds)}
        >
          Submit drafts ({draftIds.length})
        </Button>
      </div>

      {budget?.totals ? (
        <Card className="grid grid-cols-3 gap-3 p-4 text-sm">
          <div>
            <p className="text-muted-foreground">Labor (ETB)</p>
            <p className="text-lg font-semibold tabular-nums">{budget.totals.laborCostEtb}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Materials (ETB)</p>
            <p className="text-lg font-semibold tabular-nums">{budget.totals.materialCostEtb}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total (ETB)</p>
            <p className="text-lg font-semibold tabular-nums">{budget.totals.totalCostEtb}</p>
          </div>
        </Card>
      ) : null}

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select id="blockId" label="Block" value={blockId} onChange={(e) => setBlockId(e.target.value)}>
          <option value="">Select block…</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.code} · {b.estateName}
            </option>
          ))}
        </Select>
        <Select
          id="activityId"
          label="Activity"
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
        >
          <option value="">Select activity…</option>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name}
            </option>
          ))}
        </Select>
        <Input
          id="plannedQty"
          label="Planned qty"
          type="number"
          min="0"
          step="0.01"
          value={plannedQty}
          onChange={(e) => setPlannedQty(e.target.value)}
        />
        <div className="flex items-end">
          <Button className="w-full" disabled={createLine.isPending} onClick={onCreate}>
            Add line
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Block</th>
              <th className="px-4 py-2 font-medium">Activity</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium">Election</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No block AFP lines for {year}.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{line.block?.code ?? line.blockId}</td>
                  <td className="px-4 py-3">{line.activity?.name ?? line.activityId}</td>
                  <td className="px-4 py-3 tabular-nums">{line.plannedQty}</td>
                  <td className="px-4 py-3 capitalize">{line.electionStatus}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {line.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {line.electionStatus === "suggested" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateElection.isPending}
                        onClick={() =>
                          updateElection.mutate({ lineId: line.id, electionStatus: "elected" })
                        }
                      >
                        Elect
                      </Button>
                    ) : null}
                    {line.status === "returned" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={reopen.isPending}
                        onClick={() => reopen.mutate(line.id)}
                      >
                        Reopen
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
