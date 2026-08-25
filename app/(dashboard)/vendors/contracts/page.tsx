"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { vendorApi } from "@/lib/api/vendors";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useVendors } from "@/hooks/use-vendors";
import { useAfes } from "@/hooks/use-afes";
import { useRole } from "@/hooks/use-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/badges/status-badge";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { formatCurrency, formatDate } from "@/lib/utils/format";

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

type ContractFormState = {
  vendorId: string;
  afeId: string;
  contractValueUsd: string;
  procurementRoute: "competitive_tender" | "sole_source";
  tenderStatus: "n_a" | "in_progress" | "awarded";
  contractStart: string;
  contractEnd: string;
};

const EMPTY_FORM: ContractFormState = {
  vendorId: "",
  afeId: "",
  contractValueUsd: "",
  procurementRoute: "competitive_tender",
  tenderStatus: "n_a",
  contractStart: "",
  contractEnd: "",
};

const PROCUREMENT_ROUTES = [
  { value: "competitive_tender", label: "Competitive tender" },
  { value: "sole_source", label: "Sole source" },
] as const;

const TENDER_STATUSES = [
  { value: "n_a", label: "N/A" },
  { value: "in_progress", label: "In progress" },
  { value: "awarded", label: "Awarded" },
] as const;

function routeLabel(value: string) {
  return PROCUREMENT_ROUTES.find((r) => r.value === value)?.label ?? value.replace(/_/g, " ");
}

export default function VendorContractsPage() {
  const qc = useQueryClient();
  const { isSilva, isSpx } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ContractFormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["vendor-contracts"],
    queryFn: () => vendorApi.listContracts(),
  });
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: afes = [], isLoading: afesLoading } = useAfes();

  const vendorNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of vendors) map.set(v.id, v.name);
    return map;
  }, [vendors]);

  const afeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of afes) {
      map.set(a.id, a.description ? `${a.id} — ${a.description}` : a.id);
    }
    return map;
  }, [afes]);

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
    meta: { successMessage: "Contract created", errorMessage: "Could not create contract" },
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setError("");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["vendor-contracts"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create contract")),
  });

  const patchStatus = useMutation({
    mutationFn: ({ id, tenderStatus }: { id: string; tenderStatus: string }) =>
      vendorApi.updateContract(id, { tenderStatus }),
    meta: { successMessage: "Tender status updated", errorMessage: "Could not update tender status" },
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["vendor-contracts"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not update tender status")),
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  return (
    <PageShell>
      <PageHeader
        title="Vendor contracts"
        description="Procurement route and tender status for vendor work tied to AFEs."
        actions={
          isSpx ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New contract
            </Button>
          ) : undefined
        }
      />

      {isSilva ? (
        <p className="text-sm text-muted-foreground">
          Read-only view of contracts for vendors assigned to your farm areas.
        </p>
      ) : null}

      {error && !modalOpen ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <PageContent>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>AFE</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Tender</TableHead>
                      <TableHead>Dates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {vendorNameById.get(c.vendorId) ?? c.vendorId}
                            </p>
                            {!vendorNameById.has(c.vendorId) ? null : (
                              <p className="font-mono text-[10px] text-muted-foreground">{c.vendorId}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <p className="truncate text-sm" title={afeLabelById.get(c.afeId) ?? c.afeId}>
                            {afeLabelById.get(c.afeId) ?? c.afeId}
                          </p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(Number(c.contractValueUsd))}
                        </TableCell>
                        <TableCell>{routeLabel(c.procurementRoute)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={c.tenderStatus} />
                            {isSpx ? (
                              <Select
                                value={c.tenderStatus}
                                onChange={(e) =>
                                  patchStatus.mutate({ id: c.id, tenderStatus: e.target.value })
                                }
                                className="h-8 w-36"
                              >
                                {TENDER_STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </Select>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(c.contractStart)} → {formatDate(c.contractEnd)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError("");
        }}
        title="New vendor contract"
        description="Link a vendor and AFE, then set procurement route and contract dates."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Select
            label="Vendor"
            value={form.vendorId}
            onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
            disabled={vendorsLoading}
            required
          >
            <option value="">
              {vendorsLoading ? "Loading vendors…" : "Select vendor"}
            </option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.id})
              </option>
            ))}
          </Select>

          <Select
            label="AFE"
            value={form.afeId}
            onChange={(e) => setForm((f) => ({ ...f, afeId: e.target.value }))}
            disabled={afesLoading}
            required
          >
            <option value="">{afesLoading ? "Loading AFEs…" : "Select AFE"}</option>
            {afes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.description}
              </option>
            ))}
          </Select>

          <Input
            label="Contract value (USD)"
            type="number"
            min={0}
            step="0.01"
            value={form.contractValueUsd}
            onChange={(e) => setForm((f) => ({ ...f, contractValueUsd: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Procurement route"
              value={form.procurementRoute}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  procurementRoute: e.target.value as ContractFormState["procurementRoute"],
                }))
              }
            >
              {PROCUREMENT_ROUTES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            <Select
              label="Tender status"
              value={form.tenderStatus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tenderStatus: e.target.value as ContractFormState["tenderStatus"],
                }))
              }
            >
              {TENDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start date"
              type="date"
              value={form.contractStart}
              onChange={(e) => setForm((f) => ({ ...f, contractStart: e.target.value }))}
              required
            />
            <Input
              label="End date"
              type="date"
              value={form.contractEnd}
              onChange={(e) => setForm((f) => ({ ...f, contractEnd: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                create.isPending ||
                !form.vendorId ||
                !form.afeId ||
                !form.contractValueUsd ||
                !form.contractStart ||
                !form.contractEnd
              }
            >
              {create.isPending ? "Creating…" : "Create contract"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
