"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AccountabilityRow } from "@/types";
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

const emptyDraft = {
  operatingDiscipline: "",
  executeRole: "Execution partner",
  validateRole: "SPX",
  decideRole: "SPX",
  authorRole: "SPX",
  schedule3Ref: "Schedule 3",
};

export default function RaciPage() {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Partial<AccountabilityRow>>>({});
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState("");

  const { data: rows = [], isLoading } = useQuery<AccountabilityRow[]>({
    queryKey: ["accountability"],
    queryFn: () => platformApi.listAccountabilityMatrix(),
  });

  const save = useMutation({
    mutationFn: ({ discipline, body }: { discipline: string; body: Record<string, string> }) =>
      platformApi.patchAccountability(discipline, body),
    meta: { successMessage: "RACI row saved", errorMessage: "Could not update row" },
    onSuccess: (_d, vars) => {
      setError("");
      setEdits((prev) => {
        const next = { ...prev };
        delete next[vars.discipline];
        return next;
      });
      qc.invalidateQueries({ queryKey: ["accountability"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not update row")),
  });

  const create = useMutation({
    mutationFn: () => platformApi.createAccountability(draft),
    meta: { successMessage: "Discipline added", errorMessage: "Could not add discipline" },
    onSuccess: () => {
      setDraft(emptyDraft);
      setError("");
      qc.invalidateQueries({ queryKey: ["accountability"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not add discipline")),
  });

  const valueFor = (row: AccountabilityRow, key: keyof AccountabilityRow) =>
    edits[row.operatingDiscipline]?.[key] ?? row[key];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Schedule 3 RACI</h1>
        <p className="text-sm text-muted-foreground">
          Execute / Validate / Decide / Author matrix by operating discipline.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decision domain legend</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="font-medium text-foreground">Procurement</span> — competitive tender /
            sole-source routes and award authority.
          </p>
          <p>
            <span className="font-medium text-foreground">Appointment</span> — naming execution
            partners and advisors under Schedule 3.
          </p>
          <p>
            <span className="font-medium text-foreground">Emergency</span> — time-critical spend
            outside normal AFP cycle.
          </p>
          <p>
            <span className="font-medium text-foreground">Hiring</span> — field and program staffing
            decisions tied to bands.
          </p>
          <p>
            <span className="font-medium text-foreground">Reporting</span> — who authors and releases
            Silva-facing narratives.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accountability matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Execute</TableHead>
                  <TableHead>Validate</TableHead>
                  <TableHead>Decide</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Schedule 3 ref</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const d = row.operatingDiscipline;
                  return (
                    <TableRow key={d}>
                      <TableCell className="font-medium whitespace-nowrap">{d}</TableCell>
                      {(
                        ["executeRole", "validateRole", "decideRole", "authorRole", "schedule3Ref"] as const
                      ).map((key) => (
                        <TableCell key={key}>
                          <Input
                            value={String(valueFor(row, key) ?? "")}
                            onChange={(e) =>
                              setEdits((prev) => ({
                                ...prev,
                                [d]: { ...prev[d], [key]: e.target.value },
                              }))
                            }
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          size="sm"
                          disabled={save.isPending || !edits[d]}
                          onClick={() =>
                            save.mutate({
                              discipline: d,
                              body: {
                                executeRole: String(valueFor(row, "executeRole")),
                                validateRole: String(valueFor(row, "validateRole")),
                                decideRole: String(valueFor(row, "decideRole")),
                                authorRole: String(valueFor(row, "authorRole")),
                                schedule3Ref: String(valueFor(row, "schedule3Ref")),
                              },
                            })
                          }
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add discipline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Operating discipline"
            value={draft.operatingDiscipline}
            onChange={(e) => setDraft((d) => ({ ...d, operatingDiscipline: e.target.value }))}
          />
          <Input
            label="Execute"
            value={draft.executeRole}
            onChange={(e) => setDraft((d) => ({ ...d, executeRole: e.target.value }))}
          />
          <Input
            label="Validate"
            value={draft.validateRole}
            onChange={(e) => setDraft((d) => ({ ...d, validateRole: e.target.value }))}
          />
          <Input
            label="Decide"
            value={draft.decideRole}
            onChange={(e) => setDraft((d) => ({ ...d, decideRole: e.target.value }))}
          />
          <Input
            label="Author"
            value={draft.authorRole}
            onChange={(e) => setDraft((d) => ({ ...d, authorRole: e.target.value }))}
          />
          <Input
            label="Schedule 3 ref"
            value={draft.schedule3Ref}
            onChange={(e) => setDraft((d) => ({ ...d, schedule3Ref: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Button
              disabled={!draft.operatingDiscipline.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              Add row
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
