"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  useBlockFieldTickets,
  useCreateBlockFieldTicket,
  useSubmitBlockFieldTicket,
} from "@/hooks/use-block-field-tickets";
import { useCropfortOfflineSync } from "@/hooks/use-cropfort-offline-sync";
import { useVendorFarmEstates } from "@/hooks/use-vendor-farm-estates";
import { useActivityMaster } from "@/hooks/use-activity-master";

function currentWeekEnding(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function WeeklyEntryPanel() {
  const [weekEnding, setWeekEnding] = useState(currentWeekEnding());
  const { estates } = useVendorFarmEstates({ status: "active" });
  const { data: activities = [] } = useActivityMaster();
  const { data: tickets = [], isLoading } = useBlockFieldTickets({ weekEnding });
  const createTicket = useCreateBlockFieldTicket();
  const submitTicket = useSubmitBlockFieldTicket();
  const { pendingCount, syncing, syncNow, isOnline } = useCropfortOfflineSync();

  const blocks = useMemo(
    () => estates.flatMap((e) => e.blocks.map((b) => ({ ...b, estateName: e.name }))),
    [estates],
  );

  const [blockId, setBlockId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [actualQty, setActualQty] = useState("");
  const [laborHours, setLaborHours] = useState("");

  const onCreate = async () => {
    if (!blockId || !activityId || !actualQty) return;
    await createTicket.mutateAsync({
      blockId,
      activityId,
      weekEnding,
      actualQty: Number(actualQty),
      laborHoursActual: Number(laborHours || 0),
    });
    setActualQty("");
    setLaborHours("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Weekly entry</h2>
          <p className="text-sm text-muted-foreground">Log block field tickets for the selected week.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {!isOnline ? <Badge variant="outline">Offline</Badge> : null}
          {pendingCount > 0 ? (
            <Badge variant="outline">{pendingCount} queued</Badge>
          ) : null}
          <Button size="sm" variant="outline" disabled={syncing} onClick={() => syncNow()}>
            {syncing ? "Syncing…" : "Sync queue"}
          </Button>
        </div>
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          id="weekEnding"
          label="Week ending"
          type="date"
          value={weekEnding}
          onChange={(e) => setWeekEnding(e.target.value)}
        />
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
          id="actualQty"
          label="Actual qty"
          type="number"
          min="0"
          step="0.01"
          value={actualQty}
          onChange={(e) => setActualQty(e.target.value)}
        />
        <Input
          id="laborHours"
          label="Labor hours"
          type="number"
          min="0"
          step="0.1"
          value={laborHours}
          onChange={(e) => setLaborHours(e.target.value)}
        />
        <div className="flex items-end sm:col-span-2 lg:col-span-5">
          <Button disabled={createTicket.isPending} onClick={onCreate}>
            Save ticket
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
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No tickets for week ending {weekEnding}.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{ticket.block?.code ?? ticket.blockId}</td>
                  <td className="px-4 py-3">{ticket.activity?.name ?? ticket.activityId}</td>
                  <td className="px-4 py-3 tabular-nums">{ticket.actualQty}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {ticket.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ticket.status === "draft" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={submitTicket.isPending}
                        onClick={() => submitTicket.mutate(ticket.id)}
                      >
                        Submit
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
