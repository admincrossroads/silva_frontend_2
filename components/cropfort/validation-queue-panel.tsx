"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  useValidationQueue,
  useValidateWeeklySubmission,
  useReleaseWeeklySubmission,
} from "@/hooks/use-weekly-submissions";

export function ValidationQueuePanel() {
  const { data: queue = [], isLoading } = useValidationQueue();
  const validate = useValidateWeeklySubmission();
  const release = useReleaseWeeklySubmission();

  return (
    <div id="cropfort-validation">
    <DashboardPanel title="Weekly validation queue" viewAllHref="/operations/interventions?tab=weekly-entry">
      <Card className="overflow-hidden border-0 shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Week ending</th>
              <th className="px-4 py-2 font-medium">Tickets</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No weeks awaiting validation.
                </td>
              </tr>
            ) : (
              queue.map((week) => (
                <tr key={week.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{week.weekEnding.slice(0, 10)}</td>
                  <td className="px-4 py-3 tabular-nums">{week.ticketCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {week.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {week.status === "submitted" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={validate.isPending}
                          onClick={() => validate.mutate(week.weekEnding.slice(0, 10))}
                        >
                          Validate
                        </Button>
                      ) : null}
                      {week.status === "validated" ? (
                        <Button
                          size="sm"
                          disabled={release.isPending}
                          onClick={() => release.mutate(week.weekEnding.slice(0, 10))}
                        >
                          Release
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </DashboardPanel>
    </div>
  );
}
