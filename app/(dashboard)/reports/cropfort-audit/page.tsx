"use client";

import { useState } from "react";
import Link from "next/link";
import { useCropfortAudit } from "@/hooks/use-cropfort-audit";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CropfortAuditPage() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const canView = isSilva || isSpx || isSystemAdmin;
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const { data: entries = [], isLoading } = useCropfortAudit({
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    limit: 100,
  });

  if (!canView) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Cropfort audit trail is available to Silva and SPX roles.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cropfort audit trail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Append-only log for rate card, AFP, tickets, weekly submissions, and AFE actions.
        </p>
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Entity type</Label>
          <Input
            placeholder="e.g. block_field_ticket"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Entity ID</Label>
          <Input placeholder="Filter by object ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Actor</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Object</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No audit entries match your filters.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2">{entry.actor?.name ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">
                        {entry.action.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">{entry.entityType}</span>{" "}
                      <Link href={`/reports/cropfort-audit?entityId=${entry.entityId}`} className="font-mono text-xs">
                        {entry.entityId}
                      </Link>
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
