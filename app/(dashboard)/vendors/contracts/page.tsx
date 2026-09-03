"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { vendorApi } from "@/lib/api/vendors";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useVendors } from "@/hooks/use-vendors";
import { useAfes } from "@/hooks/use-afes";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type Contract = {
  id: string;
  vendorId: string;
  afeId: string;
  contractValueEtb: number;
  procurementRoute: string;
  tenderStatus: string;
  contractStart: string;
  contractEnd: string;
};

type ContractFormState = {
  vendorId: string;
  afeId: string;
  contractValueEtb: string;
  procurementRoute: "competitive_tender" | "sole_source";
  tenderStatus: "n_a" | "in_progress" | "awarded";
  contractStart: string;
  contractEnd: string;
};

const EMPTY_FORM: ContractFormState = {
  vendorId: "",
  afeId: "",
  contractValueEtb: "",
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

function tenderLabel(value: string) {
  return TENDER_STATUSES.find((s) => s.value === value)?.label ?? value.replace(/_/g, " ");
}

function afeParts(label: string, fallbackId: string) {
  const text = label || fallbackId;
  const sep = text.indexOf(" — ");
  if (sep === -1) return { code: text, detail: "" };
  return { code: text.slice(0, sep), detail: text.slice(sep + 3) };
}

export default function VendorContractsPage() {
  const qc = useQueryClient();
  const { isSpx } = useRole();
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
        contractValueEtb: Number(form.contractValueEtb),
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
        actions={
          isSpx ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New contract
            </Button>
          ) : undefined
        }
      />

      {error && !modalOpen ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <PageContent>
        <Card className="overflow-hidden border-border/80 shadow-sm">
          {isLoading ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading…</p>
          ) : contracts.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No contracts yet.</p>
          ) : (
            <>
              <ul className="divide-y md:hidden">
                {contracts.map((c) => {
                  const afe = afeParts(afeLabelById.get(c.afeId) ?? "", c.afeId);
                  return (
                    <li key={c.id} className="space-y-2.5 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {vendorNameById.get(c.vendorId) ?? c.vendorId}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{c.id}</p>
                        </div>
                        <p className="shrink-0 whitespace-nowrap tabular-nums text-sm font-semibold">
                          {formatCurrency(Number(c.contractValueEtb))}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{afe.code}</p>
                        {afe.detail ? (
                          <p className="truncate text-sm text-foreground">{afe.detail}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{routeLabel(c.procurementRoute)}</span>
                        <span aria-hidden>·</span>
                        <span className="whitespace-nowrap">
                          {formatDate(c.contractStart)} – {formatDate(c.contractEnd)}
                        </span>
                      </div>
                      {isSpx ? (
                        <Select
                          value={c.tenderStatus}
                          onChange={(e) =>
                            patchStatus.mutate({ id: c.id, tenderStatus: e.target.value })
                          }
                          className="h-9 w-full"
                        >
                          {TENDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Badge variant="outline" className="font-normal">
                          {tenderLabel(c.tenderStatus)}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[7rem]">Contract</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="min-w-[14rem]">AFE</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="w-[9rem]">Tender</TableHead>
                      <TableHead className="whitespace-nowrap">Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((c) => {
                      const afe = afeParts(afeLabelById.get(c.afeId) ?? "", c.afeId);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {c.id}
                          </TableCell>
                          <TableCell className="max-w-[14rem] font-medium">
                            <span className="line-clamp-2">
                              {vendorNameById.get(c.vendorId) ?? c.vendorId}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[18rem]">
                            <p className="font-mono text-xs text-muted-foreground">{afe.code}</p>
                            {afe.detail ? (
                              <p className="line-clamp-2 text-sm" title={afe.detail}>
                                {afe.detail}
                              </p>
                            ) : null}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right tabular-nums font-medium">
                            {formatCurrency(Number(c.contractValueEtb))}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {routeLabel(c.procurementRoute)}
                          </TableCell>
                          <TableCell>
                            {isSpx ? (
                              <Select
                                value={c.tenderStatus}
                                onChange={(e) =>
                                  patchStatus.mutate({ id: c.id, tenderStatus: e.target.value })
                                }
                                className="h-8 w-[8.5rem]"
                              >
                                {TENDER_STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </Select>
                            ) : (
                              <Badge variant="outline" className="font-normal">
                                {tenderLabel(c.tenderStatus)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(c.contractStart)} – {formatDate(c.contractEnd)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </Card>
      </PageContent>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError("");
        }}
        title="New vendor contract"
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
            <option value="">{vendorsLoading ? "Loading vendors…" : "Select vendor"}</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
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
            label="Contract value (ETB)"
            type="number"
            min={0}
            step="0.01"
            value={form.contractValueEtb}
            onChange={(e) => setForm((f) => ({ ...f, contractValueEtb: e.target.value }))}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                create.isPending ||
                !form.vendorId ||
                !form.afeId ||
                !form.contractValueEtb ||
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
