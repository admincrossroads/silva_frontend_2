"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
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

type CoaRow = {
  id: string;
  sourceAccount: string;
  glAccount: string;
  description: string;
};

export default function CoaMappingPage() {
  const qc = useQueryClient();
  const [sourceAccount, setSourceAccount] = useState("");
  const [glAccount, setGlAccount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const { data: rows = [], isLoading } = useQuery<CoaRow[]>({
    queryKey: ["coa-mapping"],
    queryFn: () => platformApi.listCoa(),
  });

  const create = useMutation({
    mutationFn: () =>
      platformApi.createCoa({
        sourceAccount,
        glAccount,
        description: description || undefined,
      }),
    onSuccess: () => {
      setSourceAccount("");
      setGlAccount("");
      setDescription("");
      setError("");
      qc.invalidateQueries({ queryKey: ["coa-mapping"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create mapping")),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">COA mapping</h1>
        <p className="text-sm text-muted-foreground">
          Map Coffee Field source accounts to GL accounts for journal exports.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add mapping</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Source account"
            value={sourceAccount}
            onChange={(e) => setSourceAccount(e.target.value)}
          />
          <Input
            label="GL account"
            value={glAccount}
            onChange={(e) => setGlAccount(e.target.value)}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="sm:col-span-3">
            <Button
              disabled={!sourceAccount.trim() || !glAccount.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mappings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>GL</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.sourceAccount}</TableCell>
                    <TableCell>{r.glAccount}</TableCell>
                    <TableCell className="text-muted-foreground">{r.description || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
