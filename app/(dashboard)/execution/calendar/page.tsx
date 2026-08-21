"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExecutionCalendarPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Season calendar</h1>
        <p className="text-sm text-muted-foreground">
          Seasonal calendars for agronomic and field timing.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming next</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This page will show seasonal calendars that drive Work Order windows and field
            readiness checks.
          </p>
          <p>P1 stub: schedule models and calendar UI come after AFP / WO execution polish.</p>
        </CardContent>
      </Card>
    </div>
  );
}
