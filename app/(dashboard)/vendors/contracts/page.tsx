"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "@/lib/api/vendors";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/badges/status-badge";

type Contract = {
  id: string;
  vendorId: string;
  afeId: string;
  contractValueUsd: number;
  procurementRoute: string;
  tenderStatus: string;
  contractStart: string;
  contractEnd: string;
};

const emptyForm = {
  vendorId: "",
  afeId: "",
  contractValueUsd: "",
  procurementRoute: "competitive_tender" as "competitive_tender" | "sole_source",
  tenderStatus: "n_a" as "n_a" | "in_progress" | "awarded",
  contractStart: "",
  contractEnd: "",
};

export default function VendorContractsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["vendor-contracts"],
    queryFn: () => vendorApi.listContracts(),
  });

  const create = useMutation({
    mutationFn: () =>
      vendorApi.createContract({
        vendorId: form.vendorId,
        afeId: form.afeId,
        contractValueUsd: Number(form.contractValueUsd),
        procurementRoute: form.procurementRoute,
        tenderStatus: form.tenderStatus,
        contractStart: form.contractStart,
        contractEnd: form.contractEnd,
      }),
    onSuccess: () => {
      setForm(emptyForm);
      setError("");
      qc.invalidateQueries({ queryKey: ["vendor-contracts"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create contract")),
  });

  const patchStatus = useMutation({
    mutationFn: ({ id, tenderStatus }: { id: string; tenderStatus: string }) =>
      vendorApi.updateContract(id, { tenderStatus }),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["vendor-contracts"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not update tender status")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor contracts</h1>
        <p className="text-sm text-muted-foreground">
          Register contracts against AFEs and track tender status.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create contract</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Vendor ID"
            value={form.vendorId}
            onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
          />
          <Input
            label="AFE ID"
            value={form.afeId}
            onChange={(e) => setForm((f) => ({ ...f, afeId: e.target.value }))}
          />
          <Input
            label="Value (USD)"
            type="number"
            value={form.contractValueUsd}
            onChange={(e) => setForm((f) => ({ ...f, contractValueUsd: e.target.value }))}
          />
          <NativeSelect
            label="Procurement route"
            value={form.procurementRoute}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                procurementRoute: e.target.value as typeof f.procurementRoute,
              }))
            }
          >
            <option value="competitive_tender">competitive_tender</option>
            <option value="sole_source">sole_source</option>
          </NativeSelect>
          <NativeSelect
            label="Tender status"
            value={form.tenderStatus}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tenderStatus: e.target.value as typeof f.tenderStatus,
              }))
            }
          >
            <option value="n_a">n_a</option>
            <option value="in_progress">in_progress</option>
            <option value="awarded">awarded</option>
          </NativeSelect>
          <Input
            label="Start"
            type="date"
            value={form.contractStart}
            onChange={(e) => setForm((f) => ({ ...f, contractStart: e.target.value }))}
          />
          <Input
            label="End"
            type="date"
            value={form.contractEnd}
            onChange={(e) => setForm((f) => ({ ...f, contractEnd: e.target.value }))}
          />
          <div className="flex items-end">
            <Button
              disabled={
                create.isPending ||
                !form.vendorId ||
                !form.afeId ||
                !form.contractValueUsd ||
                !form.contractStart ||
                !form.contractEnd
              }
              onClick={() => create.mutate()}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contracts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>AFE</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Tender</TableHead>
                  <TableHead>Dates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell className="font-mono text-xs">{c.vendorId}</TableCell>
                    <TableCell className="font-mono text-xs">{c.afeId}</TableCell>
                    <TableCell>${Number(c.contractValueUsd).toLocaleString()}</TableCell>
                    <TableCell>{c.procurementRoute}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.tenderStatus} />
                        <NativeSelect
                          value={c.tenderStatus}
                          onChange={(e) =>
                            patchStatus.mutate({ id: c.id, tenderStatus: e.target.value })
                          }
                          className="h-8 w-32"
                        >
                          <option value="n_a">n_a</option>
                          <option value="in_progress">in_progress</option>
                          <option value="awarded">awarded</option>
                        </NativeSelect>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {c.contractStart} → {c.contractEnd}
                    </TableCell>
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
