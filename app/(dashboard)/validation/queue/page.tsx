"use client";

import { useState } from "react";
import { Check, Flag, Play, Rocket, X } from "lucide-react";
import { useValidationQueue, useValidateWeeklySubmission, useReleaseWeeklySubmission } from "@/hooks/use-weekly-submissions";
import { useBlockFieldTickets, useReviewBlockFieldTicket } from "@/hooks/use-block-field-tickets";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function checkBadgeVariant(result: string) {
  if (result === "pass") return "default" as const;
  if (result === "fail") return "destructive" as const;
  return "outline" as const;
}

export default function ValidationQueuePage() {
  const { isSpx, isSystemAdmin } = useRole();
  const canManage = isSpx || isSystemAdmin;
  const { data: queue = [], isLoading } = useValidationQueue();
  const { data: pendingTickets = [] } = useBlockFieldTickets({ status: "submitted" });
  const validateWeek = useValidateWeeklySubmission();
  const releaseWeek = useReleaseWeeklySubmission();
  const reviewTicket = useReviewBlockFieldTicket();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const active = queue.find((w) => w.weekEnding.slice(0, 10) === selectedWeek) ?? queue[0] ?? null;
  const weekKey = active?.weekEnding?.slice(0, 10);

  if (!canManage) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        SPX validators review weekly submissions and run the six validation checks here.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Validation queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submitted tickets, run checks, and release weeks when hard blocks pass.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold">Weekly submissions</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : queue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weeks awaiting validation.</p>
          ) : (
            <ul className="space-y-2">
              {queue.map((week) => {
                const key = week.weekEnding.slice(0, 10);
                return (
                  <li key={week.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        (selectedWeek ?? weekKey) === key ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedWeek(key)}
                    >
                      <span>Week {key}</span>
                      <Badge variant="outline" className="capitalize">
                        {week.status}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-4 lg:col-span-2">
          {active ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">Week ending {weekKey}</h2>
                  <p className="text-xs text-muted-foreground">{active.ticketCount} ticket(s) in bundle</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={validateWeek.isPending || active.status === "pending"}
                    onClick={() => weekKey && validateWeek.mutate(weekKey)}
                  >
                    <Play className="mr-1 h-3.5 w-3.5" /> Run validation
                  </Button>
                  <Button
                    size="sm"
                    disabled={releaseWeek.isPending || active.status !== "validated"}
                    onClick={() => weekKey && releaseWeek.mutate(weekKey)}
                  >
                    <Rocket className="mr-1 h-3.5 w-3.5" /> Release week
                  </Button>
                </div>
              </div>

              {active.checks?.length ? (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Checks</h3>
                  <ul className="space-y-1.5">
                    {active.checks.map((check) => (
                      <li
                        key={check.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="font-mono text-xs">{check.checkType}</span>
                        <div className="flex items-center gap-2">
                          {check.isHardBlock ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Hard
                            </Badge>
                          ) : null}
                          <Badge variant={checkBadgeVariant(check.result)} className="capitalize">
                            {check.result}
                          </Badge>
                        </div>
                        {check.note ? <p className="w-full text-xs text-muted-foreground">{check.note}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Run validation to execute the six SPX checks.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a weekly submission from the queue.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Tickets awaiting review</h2>
          <p className="text-xs text-muted-foreground">Approve, flag, or return individual submitted tickets.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Block</th>
                <th className="px-3 py-2 font-medium">Activity</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No submitted tickets pending review.
                  </td>
                </tr>
              ) : (
                pendingTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{ticket.block?.code}</td>
                    <td className="px-3 py-2">{ticket.activity?.name}</td>
                    <td className="px-3 py-2 text-right">{ticket.actualQty}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewTicket.isPending}
                          onClick={() => reviewTicket.mutate({ ticketId: ticket.id, status: "reviewed_approved" })}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reviewTicket.isPending}
                          onClick={() => reviewTicket.mutate({ ticketId: ticket.id, status: "reviewed_flagged" })}
                        >
                          <Flag className="mr-1 h-3.5 w-3.5" /> Flag
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={reviewTicket.isPending}
                          onClick={() => reviewTicket.mutate({ ticketId: ticket.id, status: "reviewed_returned" })}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Return
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
