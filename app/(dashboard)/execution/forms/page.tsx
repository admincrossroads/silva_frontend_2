"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ifsFormApi } from "@/lib/api/field-ops";
import { workOrderApi } from "@/lib/api/work-orders";
import { getApiErrorMessage } from "@/lib/api/errors";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/use-auth";
import { isSpxRole, isVendorRole } from "@/lib/config/role-access";
import type { RoleKey } from "@/lib/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select-native";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";
import { PageShell, PageHeader, PageContent } from "@/components/layout/page-shell";

type CatalogItem = {
  formType: string;
  label: string;
  description: string;
  fields: string[];
};

type IfsForm = {
  id: string;
  formType: string;
  title: string;
  workOrderId: string | null;
  fieldTicketId: string | null;
  blockRef: string | null;
  weekNumber: number | null;
  payload: Record<string, unknown>;
  status: string;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export default function ExecutionFormsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { has } = usePermissions();
  const role = (user?.role || "") as RoleKey;
  const canCreate = isVendorRole(role) || isSpxRole(role);
  const canValidate = isSpxRole(role) || has("afe.validate");

  const [formType, setFormType] = useState("daily_work_log");
  const [title, setTitle] = useState("");
  const [workOrderId, setWorkOrderId] = useState("");
  const [blockRef, setBlockRef] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [payloadText, setPayloadText] = useState('{\n  "summary": ""\n}');
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const catalogQuery = useQuery<CatalogItem[]>({
    queryKey: ["ifs-catalog"],
    queryFn: () => ifsFormApi.catalog(),
  });
  const formsQuery = useQuery<IfsForm[]>({
    queryKey: ["ifs-forms", statusFilter],
    queryFn: () => ifsFormApi.findAll(statusFilter ? { status: statusFilter } : undefined),
  });
  const woQuery = useQuery({
    queryKey: ["work-orders-lite"],
    queryFn: () => workOrderApi.findAll(),
  });
  const selectedQuery = useQuery<IfsForm>({
    queryKey: ["ifs-form", selectedId],
    queryFn: () => ifsFormApi.findById(selectedId!),
    enabled: Boolean(selectedId),
  });

  const selectedCatalog = useMemo(
    () => catalogQuery.data?.find((c) => c.formType === formType),
    [catalogQuery.data, formType],
  );

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ifs-forms"] });
    if (selectedId) qc.invalidateQueries({ queryKey: ["ifs-form", selectedId] });
  };

  const create = useMutation({
    mutationFn: () => {
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(payloadText || "{}");
      } catch {
        throw new Error("Payload must be valid JSON");
      }
      return ifsFormApi.create({
        formType,
        title: title || selectedCatalog?.label,
        workOrderId: workOrderId || undefined,
        blockRef: blockRef || undefined,
        weekNumber: weekNumber ? Number(weekNumber) : undefined,
        payload,
      });
    },
    onSuccess: (row) => {
      setError("");
      setSelectedId(row.id);
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create form")),
  });

  const submit = useMutation({
    mutationFn: (id: string) => ifsFormApi.submit(id),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err, "Submit failed")),
  });
  const validateForm = useMutation({
    mutationFn: (id: string) => ifsFormApi.validate(id),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err, "Validate failed")),
  });
  const reject = useMutation({
    mutationFn: (id: string) => ifsFormApi.reject(id, "Needs correction before acceptance"),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err, "Reject failed")),
  });

  const workOrders = Array.isArray(woQuery.data) ? woQuery.data : [];

  return (
    <PageShell>
      <PageHeader title="Field forms (IFS)" />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <PageContent>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Form catalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(catalogQuery.data ?? []).map((item) => (
              <button
                key={item.formType}
                type="button"
                onClick={() => {
                  setFormType(item.formType);
                  setTitle(item.label);
                  setPayloadText(
                    `{\n${item.fields.map((f) => `  "${f}": ""`).join(",\n")}\n}`,
                  );
                }}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  formType === item.formType ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <p className="font-medium">{item.label}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {canCreate ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Capture form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <NativeSelect
                    label="Work order"
                    value={workOrderId}
                    onChange={(e) => setWorkOrderId(e.target.value)}
                  >
                    <option value="">Optional</option>
                    {workOrders.map((wo: { id: string; activity: string }) => (
                      <option key={wo.id} value={wo.id}>
                        {wo.id} — {wo.activity}
                      </option>
                    ))}
                  </NativeSelect>
                  <Input label="Block ref" value={blockRef} onChange={(e) => setBlockRef(e.target.value)} />
                  <Input
                    label="Week #"
                    type="number"
                    min={1}
                    max={52}
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                  />
                </div>
                <Textarea
                  label="Payload (JSON)"
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="min-h-[140px] font-mono text-xs"
                />
                <div className="flex justify-end">
                  <Button onClick={() => create.mutate()} disabled={create.isPending}>
                    Save draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Submitted forms</CardTitle>
              <NativeSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-40"
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="validated">Validated</option>
                <option value="rejected">Rejected</option>
              </NativeSelect>
            </CardHeader>
            <CardContent>
              {formsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (formsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No IFS forms yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form</TableHead>
                      <TableHead>WO</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(formsQuery.data ?? []).map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(row.id)}
                      >
                        <TableCell>
                          <p className="font-medium text-sm">{row.title}</p>
                          <p className="text-xs text-muted-foreground">{row.formType}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.workOrderId ? (
                            <Link
                              href={`/execution/work-orders/${row.workOrderId}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {row.workOrderId}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(row.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {selectedQuery.data ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selectedQuery.data.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusBadge status={selectedQuery.data.status} />
                  <span className="text-xs text-muted-foreground">{selectedQuery.data.formType}</span>
                  {selectedQuery.data.blockRef ? (
                    <span className="text-xs text-muted-foreground">Block {selectedQuery.data.blockRef}</span>
                  ) : null}
                </div>
                <pre className="rounded-md bg-muted/60 p-3 text-xs overflow-auto">
                  {JSON.stringify(selectedQuery.data.payload, null, 2)}
                </pre>
                {selectedQuery.data.rejectionReason ? (
                  <p className="text-sm text-destructive">{selectedQuery.data.rejectionReason}</p>
                ) : null}
                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedQuery.data.status === "draft" && canCreate ? (
                    <Button size="sm" onClick={() => submit.mutate(selectedQuery.data.id)}>
                      Submit to SPX
                    </Button>
                  ) : null}
                  {selectedQuery.data.status === "submitted" && canValidate ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => reject.mutate(selectedQuery.data.id)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => validateForm.mutate(selectedQuery.data.id)}>
                        Validate
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
      </PageContent>
    </PageShell>
  );
}
