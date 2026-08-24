"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";

type Disclosure = {
  id: string;
  party: string;
  relationship: string;
  period: string;
  notes: string | null;
  createdAt: string;
};

const empty = { party: "", relationship: "", period: "", notes: "" };

export default function DisclosuresPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canEdit = Boolean(user?.role?.startsWith("spx_") || user?.role === "system_admin");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { data: rows = [], isLoading } = useQuery<Disclosure[]>({
    queryKey: ["disclosures"],
    queryFn: () => platformApi.listDisclosures(),
  });

  const create = useMutation({
    mutationFn: () =>
      platformApi.createDisclosure({
        party: form.party,
        relationship: form.relationship,
        period: form.period,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      setForm(empty);
      setError("");
      qc.invalidateQueries({ queryKey: ["disclosures"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create disclosure")),
  });

  const patch = useMutation({
    mutationFn: () =>
      platformApi.patchDisclosure(editingId!, {
        party: form.party,
        relationship: form.relationship,
        period: form.period,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      setEditingId(null);
      setForm(empty);
      setError("");
      qc.invalidateQueries({ queryKey: ["disclosures"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not update disclosure")),
  });

  const startEdit = (row: Disclosure) => {
    setEditingId(row.id);
    setForm({
      party: row.party,
      relationship: row.relationship,
      period: row.period,
      notes: row.notes ?? "",
    });
  };

  return (
    <PageShell className="max-w-4xl">
      <PageHeader title="Related-party disclosures" />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <PageContent>
      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit disclosure" : "Create disclosure"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Party"
              value={form.party}
              onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))}
            />
            <Input
              label="Relationship"
              value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
            />
            <Input
              label="Period"
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
              placeholder="2026-Q1"
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button
                disabled={
                  !(form.party && form.relationship && form.period) ||
                  create.isPending ||
                  patch.isPending
                }
                onClick={() => (editingId ? patch.mutate() : create.mutate())}
              >
                {editingId ? "Save" : "Create"}
              </Button>
              {editingId ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(empty);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disclosures</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disclosures yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Notes</TableHead>
                  {canEdit ? <TableHead /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.party}</TableCell>
                    <TableCell>{r.relationship}</TableCell>
                    <TableCell>{r.period}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {r.notes || "—"}
                    </TableCell>
                    {canEdit ? (
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(r)}>
                          Edit
                        </Button>
                      </TableCell>
                    ) : null}
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
