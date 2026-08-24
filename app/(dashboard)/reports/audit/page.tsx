"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";
import { PageShell, PageHeader, PageFilters, PageContent } from "@/components/layout/page-shell";

type AuditRow = {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  timestamp: string;
};

export default function AuditLogPage() {
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [action, setAction] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: rows = [], isLoading, isFetching } = useQuery<AuditRow[]>({
    queryKey: ["audit-log", filters],
    queryFn: () => platformApi.listAudit(filters),
  });

  const apply = () => {
    const next: Record<string, string> = {};
    if (entityType.trim()) next.entityType = entityType.trim();
    if (entityId.trim()) next.entityId = entityId.trim();
    if (action.trim()) next.action = action.trim();
    setFilters(next);
  };

  return (
    <PageShell className="max-w-5xl">
      <PageHeader title="Audit trail" />

      <PageFilters>
        <Input
          label="Entity type"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="afe"
        />
        <Input
          label="Entity ID"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
        <Input
          label="Action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="update"
        />
        <Button onClick={apply} disabled={isFetching}>
          Apply
        </Button>
      </PageFilters>

      <PageContent>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit rows match.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(r.timestamp)}</TableCell>
                    <TableCell className="font-mono text-xs">{r.userId}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{r.entityType}</span>{" "}
                      <span className="font-mono text-xs">{r.entityId}</span>
                    </TableCell>
                    <TableCell>{r.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </PageContent>
    </PageShell>
  );
}
