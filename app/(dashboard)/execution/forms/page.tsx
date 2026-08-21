"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExecutionFormsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Field forms (IFS)</h1>
        <p className="text-sm text-muted-foreground">
          Instrument Field System form subset for work capture.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming next</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This page will host the IFS forms subset for field execution — structured capture
            aligned to Work Orders and Field Tickets.
          </p>
          <p>P1 stub: UI and API wiring land after core execution flows stabilize.</p>
        </CardContent>
      </Card>
    </div>
  );
}
