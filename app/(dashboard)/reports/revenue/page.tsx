"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
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
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus } from "lucide-react";

export type RevenueEntry = {
  id: string;
  period: string;
  tier: string;
  feeDescription: string;
  amountUsd: number;
  amountEtb: number;
  invoiceDate: string;
  paymentStatus: string;
};

type RevenueFormState = {
  period: string;
  tier: string;
  feeDescription: string;
  amountUsd: string;
  amountEtb: string;
  invoiceDate: string;
  paymentStatus: string;
};

const EMPTY_FORM: RevenueFormState = {
  period: "",
  tier: "retainer",
  feeDescription: "",
  amountUsd: "",
  amountEtb: "0",
  invoiceDate: new Date().toISOString().slice(0, 10),
  paymentStatus: "invoiced",
};

function entryToEditForm(entry: RevenueEntry): RevenueFormState {
  return {
    period: entry.period,
    tier: entry.tier,
    feeDescription: entry.feeDescription,
    amountUsd: String(entry.amountUsd),
    amountEtb: String(entry.amountEtb ?? 0),
    invoiceDate: entry.invoiceDate,
    paymentStatus: entry.paymentStatus,
  };
}

export default function RevenueLedgerPage() {
  const qc = useQueryClient();
  const { has } = usePermissions();
  const router = useRouter();
  const allowed = has("revenue_ledger.full");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RevenueEntry | null>(null);
  const [form, setForm] = useState<RevenueFormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowed) router.replace("/dashboard");
  }, [allowed, router]);

  const { data = [], isLoading } = useQuery<RevenueEntry[]>({
    queryKey: ["revenue-ledger"],
    queryFn: () => platformApi.listRevenue(),
    enabled: allowed,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      platformApi.createRevenue({
        period: form.period,
        tier: form.tier,
        feeDescription: form.feeDescription,
        amountUsd: Number(form.amountUsd),
        amountEtb: form.amountEtb ? Number(form.amountEtb) : undefined,
        invoiceDate: form.invoiceDate,
        paymentStatus: form.paymentStatus,
      }),
    meta: { successMessage: "Revenue entry created", errorMessage: "Could not create entry" },
    onSuccess: () => {
      setError("");
      setModalOpen(false);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["revenue-ledger"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create entry")),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      platformApi.updateRevenue(editing!.id, {
        feeDescription: form.feeDescription,
        amountUsd: Number(form.amountUsd),
        amountEtb: form.amountEtb ? Number(form.amountEtb) : undefined,
        paymentStatus: form.paymentStatus,
      }),
    meta: { successMessage: "Revenue entry updated", errorMessage: "Could not update entry" },
    onSuccess: () => {
      setError("");
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      qc.invalidateQueries({ queryKey: ["revenue-ledger"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not update entry")),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (entry: RevenueEntry) => {
    setEditing(entry);
    setForm(entryToEditForm(entry));
    setError("");
    setModalOpen(true);
  };

  if (!allowed) return null;

  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        title="SPX Revenue Ledger"
        description="SPX fee recognition — not visible to Silva or vendors (revenue firewall)."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New entry
          </Button>
        }
      />

      {error && !modalOpen ? <p className="text-sm text-destructive">{error}</p> : null}

      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ledger entries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Amount (USD)</TableHead>
                      <TableHead className="text-right">Amount (ETB)</TableHead>
                      <TableHead>Invoice date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.id}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium">{row.feeDescription}</TableCell>
                        <TableCell className="capitalize">{row.tier}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(row.amountUsd)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.amountEtb ? `${row.amountEtb.toLocaleString()} ETB` : "—"}
                        </TableCell>
                        <TableCell>{formatDate(row.invoiceDate)}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.paymentStatus} />
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                            Edit
                          </Button>
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
          setEditing(null);
          setError("");
        }}
        title={editing ? "Edit revenue entry" : "New revenue entry"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (editing) updateMutation.mutate();
            else createMutation.mutate();
          }}
        >
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {!editing ? (
            <>
              <Input
                label="Period (YYYY-MM)"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                placeholder="2026-08"
                required
              />
              <Select
                label="Tier"
                value={form.tier}
                onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
              >
                <option value="retainer">Retainer</option>
                <option value="project">Project</option>
                <option value="special">Special</option>
              </Select>
              <Input
                label="Invoice date"
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))}
                required
              />
            </>
          ) : (
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">ID:</span> {editing.id}
              </p>
              <p>
                <span className="font-medium text-foreground">Period:</span> {editing.period} ·{" "}
                <span className="capitalize">{editing.tier}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Invoice date:</span>{" "}
                {formatDate(editing.invoiceDate)}
              </p>
            </div>
          )}

          <Input
            label="Fee description"
            value={form.feeDescription}
            onChange={(e) => setForm((f) => ({ ...f, feeDescription: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (USD)"
              type="number"
              step="0.01"
              value={form.amountUsd}
              onChange={(e) => setForm((f) => ({ ...f, amountUsd: e.target.value }))}
              required
            />
            <Input
              label="Amount (ETB)"
              type="number"
              step="0.01"
              value={form.amountEtb}
              onChange={(e) => setForm((f) => ({ ...f, amountEtb: e.target.value }))}
            />
          </div>

          <Select
            label="Payment status"
            value={form.paymentStatus}
            onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
          >
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editing
                ? updateMutation.isPending
                  ? "Saving…"
                  : "Save changes"
                : createMutation.isPending
                  ? "Creating…"
                  : "Create entry"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
