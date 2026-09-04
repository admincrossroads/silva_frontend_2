"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useActiveFarmEstate } from "@/hooks/use-active-farm-estate";
import { useRole } from "@/hooks/use-role";
import {
  useApproveFieldWorkCalendar,
  useFieldWorkCalendar,
  useSeedFieldWorkCalendar,
  useSubmitFieldWorkCalendar,
} from "@/hooks/use-field-work-calendar";
import { IntensityGrid } from "./IntensityGrid";
import { ActivityReferenceTable } from "./ActivityReferenceTable";
import { MonthlyFeeSchedulePanel } from "./MonthlyFeeSchedulePanel";
import { FarmBudgetPanel } from "@/components/cropfort/budget/FarmBudgetPanel";

export function FieldWorkCalendarPanel() {
  const { activeFarmEstateId, activeFarmEstate, isLoading: estateLoading, emptyMessage } =
    useActiveFarmEstate();
  const { isSpx, isSystemAdmin, isSilva } = useRole();
  const canEdit = isSpx || isSystemAdmin;
  const canApprove = isSilva || isSystemAdmin;

  const farmId = activeFarmEstateId ?? undefined;
  const { data: calendar, isLoading, isError, error } = useFieldWorkCalendar(farmId);
  const seed = useSeedFieldWorkCalendar(farmId || "");
  const submit = useSubmitFieldWorkCalendar(farmId || "");
  const approve = useApproveFieldWorkCalendar(farmId || "");

  if (estateLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading farm…
      </div>
    );
  }

  if (!farmId) {
    return <p className="text-sm text-muted-foreground">{emptyMessage || "Select a farm estate."}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <p className="text-sm font-medium">{activeFarmEstate?.name}</p>
          {calendar?.termStartDate ? (
            <p className="text-xs text-muted-foreground">
              Term start {String(calendar.termStartDate).slice(0, 10)}
            </p>
          ) : null}
        </div>
        {calendar ? <Badge variant="outline">{calendar.status}</Badge> : null}
        <div className="ml-auto flex flex-wrap gap-2">
          {canEdit ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={seed.isPending || !farmId}
                onClick={() => seed.mutate()}
              >
                {seed.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Seed from templates
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!calendar || calendar.status !== "draft" || submit.isPending}
                onClick={() => submit.mutate()}
              >
                Submit calendar
              </Button>
            </>
          ) : null}
          {canApprove ? (
            <Button
              size="sm"
              disabled={!calendar || calendar.status !== "submitted" || approve.isPending}
              onClick={() => approve.mutate()}
            >
              Approve calendar
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar…
        </div>
      ) : null}
      {isError ? <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p> : null}

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">36-month calendar</TabsTrigger>
          <TabsTrigger value="fees">Monthly fee schedule</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="reference">Activity reference</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          {calendar ? (
            <IntensityGrid calendar={calendar} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No field work calendar yet. Seed from activity templates to create the intensity grid.
            </p>
          )}
        </TabsContent>
        <TabsContent value="fees" className="mt-4">
          <MonthlyFeeSchedulePanel farmId={farmId} />
        </TabsContent>
        <TabsContent value="budget" className="mt-4">
          <FarmBudgetPanel
            farmId={farmId}
            farmName={activeFarmEstate?.name}
            embedded
          />
        </TabsContent>
        <TabsContent value="reference" className="mt-4">
          {calendar ? (
            <ActivityReferenceTable calendar={calendar} />
          ) : (
            <p className="text-sm text-muted-foreground">Seed the calendar to populate activity reference.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
