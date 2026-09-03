"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useRateCardLines,
  useCreateRateCardLine,
  useSubmitRateCard,
  useReopenRateCardLine,
} from "@/hooks/use-rate-card";

export function RateCardPanel() {
  const { data: lines = [], isLoading } = useRateCardLines();
  const createLine = useCreateRateCardLine();
  const submit = useSubmitRateCard();
  const reopen = useReopenRateCardLine();
  const [resourceCode, setResourceCode] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("day");
  const [rateEtb, setRateEtb] = useState("");

  const draftIds = lines.filter((l) => l.status === "draft").map((l) => l.id);

  const onCreate = async () => {
    if (!resourceCode.trim() || !resourceName.trim() || !rateEtb) return;
    await createLine.mutateAsync({
      resourceCode: resourceCode.trim(),
      resourceName: resourceName.trim(),
      unitOfMeasure: unitOfMeasure.trim() || "day",
      rateEtb: Number(rateEtb),
    });
    setResourceCode("");
    setResourceName("");
    setRateEtb("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Rate card</h2>
          <p className="text-sm text-muted-foreground">Create and submit resource rates for Silva approval.</p>
        </div>
        <Button
          variant="outline"
          disabled={!draftIds.length || submit.isPending}
          onClick={() => submit.mutate(draftIds)}
        >
          Submit drafts ({draftIds.length})
        </Button>
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          id="rc-code"
          label="Resource code"
          value={resourceCode}
          onChange={(e) => setResourceCode(e.target.value)}
          placeholder="LAB-01"
        />
        <Input
          id="rc-name"
          label="Resource name"
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
          placeholder="Field labor"
        />
        <Input
          id="rc-uom"
          label="Unit"
          value={unitOfMeasure}
          onChange={(e) => setUnitOfMeasure(e.target.value)}
        />
        <Input
          id="rc-rate"
          label="Rate (ETB)"
          type="number"
          min="0"
          step="0.01"
          value={rateEtb}
          onChange={(e) => setRateEtb(e.target.value)}
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
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Resource</th>
              <th className="px-4 py-2 font-medium">Rate (ETB)</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : lines.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No rate lines yet.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{line.resourceCode}</td>
                  <td className="px-4 py-3">{line.resourceName}</td>
                  <td className="px-4 py-3 tabular-nums">{line.rateEtb}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {line.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
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
