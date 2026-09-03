"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { SimplePagination, useClientPagination } from "@/components/ui/simple-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import type {
  CreateRateCardLineDto,
  LaborRateCard,
  RateCardLine,
  RateCardResourceType,
} from "@/lib/api/cropfort/rate-card";
import {
  useApproveRateCardLine,
  useCreateRateCardLine,
  useLaborRateCards,
  useRateCardLines,
  useRateCardMeta,
  useReopenRateCardLine,
  useReturnRateCardLine,
  useSubmitRateCard,
  useUpdateRateCardLine,
} from "@/hooks/use-rate-card";

type StatusFilter = "all" | "draft" | "submitted" | "approved" | "returned";
type TypeFilter = "all" | RateCardResourceType;
type FlagFilter = "all" | "flagged" | "ok";
type BuilderForm = {
  resourceCode: string;
  resourceName: string;
  resourceType: RateCardResourceType | "";
  unitOfMeasure: string;
  rateEtb: string;
  benchmarkFarmARate: string;
  benchmarkFarmBRate: string;
  spxJustificationNote: string;
};

const EMPTY_FORM: BuilderForm = {
  resourceCode: "",
  resourceName: "",
  resourceType: "material",
  unitOfMeasure: "unit",
  rateEtb: "",
  benchmarkFarmARate: "",
  benchmarkFarmBRate: "",
  spxJustificationNote: "",
};

const TABLE_HEAD =
  "border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const TABLE_ROW = "border-b last:border-0 align-top transition-colors hover:bg-muted/30";
const TABLE_CELL = "px-3 py-3";

function num(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatEtb(value: number | string | null | undefined): string {
  const n = num(value);
  if (n == null) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatPct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesHaystack(query: string, parts: Array<string | null | undefined>): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  return parts
    .filter((p): p is string => Boolean(p && String(p).trim()))
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function matchesRateLineSearch(line: RateCardLine, query: string): boolean {
  return matchesHaystack(query, [
    line.resourceCode,
    line.resourceName,
    line.resourceType,
    line.unitOfMeasure,
    line.spxJustificationNote,
    line.returnedComment,
  ]);
}

function matchesLaborSearch(row: LaborRateCard, query: string): boolean {
  return matchesHaystack(query, [
    row.farmEstateName,
    row.farmEstateId,
    row.activityCode,
    row.activityName,
    row.status,
  ]);
}

function lineToForm(line: RateCardLine): BuilderForm {
  return {
    resourceCode: line.resourceCode,
    resourceName: line.resourceName,
    resourceType: (line.resourceType as RateCardResourceType) || "",
    unitOfMeasure: line.unitOfMeasure,
    rateEtb: String(num(line.rateEtb) ?? ""),
    benchmarkFarmARate: line.benchmarkFarmARate != null ? String(num(line.benchmarkFarmARate) ?? "") : "",
    benchmarkFarmBRate: line.benchmarkFarmBRate != null ? String(num(line.benchmarkFarmBRate) ?? "") : "",
    spxJustificationNote: line.spxJustificationNote ?? "",
  };
}

function formToDto(form: BuilderForm): CreateRateCardLineDto {
  return {
    resourceCode: form.resourceCode.trim(),
    resourceName: form.resourceName.trim(),
    resourceType: form.resourceType || null,
    unitOfMeasure: form.unitOfMeasure.trim() || "unit",
    rateEtb: Number(form.rateEtb),
    benchmarkFarmARate: form.benchmarkFarmARate ? Number(form.benchmarkFarmARate) : null,
    benchmarkFarmBRate: form.benchmarkFarmBRate ? Number(form.benchmarkFarmBRate) : null,
    spxJustificationNote: form.spxJustificationNote.trim() || null,
  };
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
      : status === "submitted"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-800"
        : status === "returned"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-muted/60 text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("capitalize", tone)}>
      {status}
    </Badge>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "amber" | "emerald" | "rose" | "sky";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-500/25 bg-amber-500/[0.06]"
      : tone === "emerald"
        ? "border-emerald-500/25 bg-emerald-500/[0.06]"
        : tone === "rose"
          ? "border-rose-500/25 bg-rose-500/[0.06]"
          : tone === "sky"
            ? "border-sky-500/25 bg-sky-500/[0.06]"
            : "border-border/80 bg-card";
  return (
    <div className={cn("rounded-xl border px-3.5 py-3 shadow-sm", toneClass)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
    </div>
  );
}

function FilterToolbar({ children }: { children: ReactNode }) {
  return (
    <Card className="border-dashed bg-muted/20 p-3 shadow-none">
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </Card>
  );
}

function TableShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </Card>
  );
}

function RateCardBuilder() {
  const { data: lines = [], isLoading } = useRateCardLines();
  const { data: meta } = useRateCardMeta();
  const createLine = useCreateRateCardLine();
  const updateLine = useUpdateRateCardLine();
  const submit = useSubmitRateCard();
  const reopen = useReopenRateCardLine();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<BuilderForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    return lines.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (typeFilter !== "all" && l.resourceType !== typeFilter) return false;
      if (flagFilter === "flagged" && !l.isFlagged) return false;
      if (flagFilter === "ok" && l.isFlagged) return false;
      return matchesRateLineSearch(l, search);
    });
  }, [lines, statusFilter, typeFilter, flagFilter, search]);

  const pagination = useClientPagination(filtered, 10);

  const draftIds = lines.filter((l) => l.status === "draft").map((l) => l.id);
  const selectedDraftIds = draftIds.filter((id) => selected[id]);
  const submitIds = selectedDraftIds.length ? selectedDraftIds : draftIds;
  const flaggedDraftsNeedingNote = lines.filter(
    (l) => l.status === "draft" && l.isFlagged && !l.spxJustificationNote?.trim(),
  );

  const setField = <K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const onSave = async () => {
    setFormError("");
    if (!form.resourceCode.trim() || !form.resourceName.trim() || !form.rateEtb) {
      setFormError("Code, name, and rate are required.");
      return;
    }
    const dto = formToDto(form);
    try {
      if (editingId) {
        await updateLine.mutateAsync({ lineId: editingId, dto });
      } else {
        await createLine.mutateAsync(dto);
      }
      closeForm();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not save rate line"));
    }
  };

  const onSubmit = async () => {
    setError("");
    if (!submitIds.length) return;
    try {
      await submit.mutateAsync(submitIds);
      setSelected({});
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit rate card"));
    }
  };

  const startEdit = (line: RateCardLine) => {
    if (line.status !== "draft") return;
    setEditingId(line.id);
    setForm(lineToForm(line));
    setFormError("");
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {meta ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Draft" value={meta.counts.draft} />
          <StatTile label="Submitted" value={meta.counts.submitted} tone="amber" />
          <StatTile label="Approved" value={meta.counts.approved} tone="emerald" />
          <StatTile label="Returned" value={meta.counts.returned} tone="rose" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add line
          </Button>
          <Button
            disabled={!submitIds.length || submit.isPending || flaggedDraftsNeedingNote.length > 0}
            onClick={onSubmit}
            className="gap-1.5"
          >
            <ClipboardList className="h-4 w-4" />
            Submit {selectedDraftIds.length ? selectedDraftIds.length : draftIds.length || ""} drafts
          </Button>
        </div>
      </div>

      {flaggedDraftsNeedingNote.length > 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
          {flaggedDraftsNeedingNote.length} flagged draft(s) need a justification before submit.
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingId ? "Edit line" : "Add line"}
        className="sm:max-w-lg"
      >
        <div className="space-y-4">
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              id="rc-code"
              label="Code"
              value={form.resourceCode}
              onChange={(e) => setField("resourceCode", e.target.value)}
            />
            <Input
              id="rc-name"
              label="Name"
              value={form.resourceName}
              onChange={(e) => setField("resourceName", e.target.value)}
            />
            <Select
              id="rc-type"
              label="Type"
              value={form.resourceType}
              onChange={(e) => setField("resourceType", e.target.value as RateCardResourceType | "")}
            >
              <option value="material">Material</option>
              <option value="service">Service</option>
            </Select>
            <Input
              id="rc-uom"
              label="UoM"
              value={form.unitOfMeasure}
              onChange={(e) => setField("unitOfMeasure", e.target.value)}
            />
            <Input
              id="rc-rate"
              label="Rate (ETB)"
              type="number"
              min="0"
              step="0.01"
              value={form.rateEtb}
              onChange={(e) => setField("rateEtb", e.target.value)}
            />
            <Input
              id="rc-bench-a"
              label="Benchmark A"
              type="number"
              min="0"
              step="0.01"
              value={form.benchmarkFarmARate}
              onChange={(e) => setField("benchmarkFarmARate", e.target.value)}
            />
            <Input
              id="rc-bench-b"
              label="Benchmark B"
              type="number"
              min="0"
              step="0.01"
              value={form.benchmarkFarmBRate}
              onChange={(e) => setField("benchmarkFarmBRate", e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                id="rc-note"
                label="Justification"
                value={form.spxJustificationNote}
                onChange={(e) => setField("spxJustificationNote", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button disabled={createLine.isPending || updateLine.isPending} onClick={onSave}>
              {editingId ? "Save" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      <FilterToolbar>
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-[2.15rem] h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="rc-search"
            label="Search"
            placeholder="Code, name, note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          id="rc-filter"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-36"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="returned">Returned</option>
        </Select>
        <Select
          id="rc-type-filter"
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="w-36"
        >
          <option value="all">All</option>
          <option value="material">Material</option>
          <option value="service">Service</option>
        </Select>
        <Select
          id="rc-flag-filter"
          label="Variance"
          value={flagFilter}
          onChange={(e) => setFlagFilter(e.target.value as FlagFilter)}
          className="w-36"
        >
          <option value="all">All</option>
          <option value="flagged">Flagged</option>
          <option value="ok">Not flagged</option>
        </Select>
        {draftIds.length > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className="self-end"
            onClick={() => setSelected(Object.fromEntries(draftIds.map((id) => [id, true])))}
          >
            Select drafts
          </Button>
        ) : null}
      </FilterToolbar>

      <TableShell
        footer={
          <SimplePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        }
      >
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className={TABLE_HEAD}>
              <th className={cn(TABLE_CELL, "w-8")} />
              <th className={TABLE_CELL}>Code</th>
              <th className={TABLE_CELL}>Resource</th>
              <th className={TABLE_CELL}>Type</th>
              <th className={TABLE_CELL}>Rate</th>
              <th className={TABLE_CELL}>Bench A/B</th>
              <th className={TABLE_CELL}>Variance</th>
              <th className={TABLE_CELL}>Status</th>
              <th className={TABLE_CELL}>Note</th>
              <th className={TABLE_CELL} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10}>
                  <EmptyState icon={FileText} title="Loading rate lines…" />
                </td>
              </tr>
            ) : pagination.slice.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <EmptyState icon={Package} title="No matching lines" />
                </td>
              </tr>
            ) : (
              pagination.slice.map((line) => (
                <tr key={line.id} className={TABLE_ROW}>
                  <td className={TABLE_CELL}>
                    {line.status === "draft" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(selected[line.id])}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [line.id]: e.target.checked }))
                        }
                        aria-label={`Select ${line.resourceCode}`}
                        className="h-4 w-4 rounded border-border"
                      />
                    ) : null}
                  </td>
                  <td className={cn(TABLE_CELL, "font-mono text-xs text-muted-foreground")}>
                    {line.resourceCode}
                  </td>
                  <td className={TABLE_CELL}>
                    <p className="font-medium text-foreground">{line.resourceName}</p>
                    <p className="text-xs text-muted-foreground">
                      v{line.version} · {line.unitOfMeasure}
                    </p>
                    {line.returnedComment ? (
                      <p className="mt-1 text-xs text-destructive">{line.returnedComment}</p>
                    ) : null}
                  </td>
                  <td className={cn(TABLE_CELL, "capitalize text-muted-foreground")}>
                    {line.resourceType || "—"}
                  </td>
                  <td className={cn(TABLE_CELL, "tabular-nums font-medium")}>
                    {formatEtb(line.rateEtb)}
                  </td>
                  <td className={cn(TABLE_CELL, "tabular-nums text-muted-foreground")}>
                    {formatEtb(line.benchmarkFarmARate)} / {formatEtb(line.benchmarkFarmBRate)}
                  </td>
                  <td className={TABLE_CELL}>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="tabular-nums">{formatPct(line.variancePct)}</span>
                      {line.isFlagged ? (
                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-800">
                          Flagged
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className={TABLE_CELL}>
                    <StatusBadge status={line.status} />
                  </td>
                  <td className={cn(TABLE_CELL, "max-w-[12rem] text-xs text-muted-foreground")}>
                    {line.spxJustificationNote || "—"}
                  </td>
                  <td className={cn(TABLE_CELL, "text-right")}>
                    {line.status === "draft" ? (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(line)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    ) : null}
                    {line.status === "returned" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reopen.isPending}
                        onClick={() => reopen.mutate(line.id)}
                      >
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Reopen
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

function RateCardApprovals() {
  const { data: submitted = [], isLoading: loadingSubmitted } = useRateCardLines("submitted");
  const { data: approved = [], isLoading: loadingApproved } = useRateCardLines("approved");
  const approve = useApproveRateCardLine();
  const returnLine = useReturnRateCardLine();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingType, setPendingType] = useState<TypeFilter>("all");
  const [pendingFlag, setPendingFlag] = useState<FlagFilter>("all");
  const [approvedSearch, setApprovedSearch] = useState("");
  const [approvedType, setApprovedType] = useState<TypeFilter>("all");

  const pendingFiltered = useMemo(() => {
    return submitted.filter((l) => {
      if (pendingType !== "all" && l.resourceType !== pendingType) return false;
      if (pendingFlag === "flagged" && !l.isFlagged) return false;
      if (pendingFlag === "ok" && l.isFlagged) return false;
      return matchesRateLineSearch(l, pendingSearch);
    });
  }, [submitted, pendingSearch, pendingType, pendingFlag]);

  const approvedFiltered = useMemo(() => {
    return approved.filter((l) => {
      if (approvedType !== "all" && l.resourceType !== approvedType) return false;
      return matchesRateLineSearch(l, approvedSearch);
    });
  }, [approved, approvedSearch, approvedType]);

  const pendingPage = useClientPagination(pendingFiltered, 10);
  const approvedPage = useClientPagination(approvedFiltered, 10);

  const onApprove = async (lineId: string) => {
    setError("");
    try {
      await approve.mutateAsync({ lineId });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not approve line"));
    }
  };

  const onReturn = async (lineId: string) => {
    setError("");
    const comment = returnComment[lineId]?.trim();
    if (!comment) {
      setError("Return comment is required.");
      return;
    }
    try {
      await returnLine.mutateAsync({ lineId, comment });
      setReturnComment((prev) => ({ ...prev, [lineId]: "" }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not return line"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <StatTile label="Pending review" value={submitted.length} tone="amber" />
        <StatTile label="Approved rates" value={approved.length} tone="emerald" />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Tabs defaultValue="pending">
        <TabsList className="h-11 w-full justify-start gap-1 rounded-xl bg-muted/70 p-1 sm:w-auto">
          <TabsTrigger value="pending" className="gap-1.5 rounded-lg px-4 data-[state=active]:shadow-sm">
            <ClipboardList className="h-3.5 w-3.5" />
            Pending ({submitted.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5 rounded-lg px-4 data-[state=active]:shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved ({approved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          <FilterToolbar>
            <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-[2.15rem] h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="rc-pending-search"
                label="Search"
                placeholder="Code, name, note…"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              id="rc-pending-type"
              label="Type"
              value={pendingType}
              onChange={(e) => setPendingType(e.target.value as TypeFilter)}
              className="w-36"
            >
              <option value="all">All</option>
              <option value="material">Material</option>
              <option value="service">Service</option>
            </Select>
            <Select
              id="rc-pending-flag"
              label="Variance"
              value={pendingFlag}
              onChange={(e) => setPendingFlag(e.target.value as FlagFilter)}
              className="w-36"
            >
              <option value="all">All</option>
              <option value="flagged">Flagged</option>
              <option value="ok">Not flagged</option>
            </Select>
          </FilterToolbar>
          <TableShell
            footer={
              <SimplePagination
                page={pendingPage.page}
                pageSize={pendingPage.pageSize}
                total={pendingPage.total}
                pageCount={pendingPage.pageCount}
                onPageChange={pendingPage.setPage}
                onPageSizeChange={pendingPage.setPageSize}
              />
            }
          >
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className={TABLE_HEAD}>
                  <th className={TABLE_CELL}>Resource</th>
                  <th className={TABLE_CELL}>Rate</th>
                  <th className={TABLE_CELL}>Benchmarks</th>
                  <th className={TABLE_CELL}>Variance</th>
                  <th className={TABLE_CELL}>Justification</th>
                  <th className={TABLE_CELL}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingSubmitted ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={ClipboardList} title="Loading pending lines…" />
                    </td>
                  </tr>
                ) : pendingPage.slice.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={CheckCircle2} title="Nothing pending" />
                    </td>
                  </tr>
                ) : (
                  pendingPage.slice.map((line) => (
                    <tr key={line.id} className={TABLE_ROW}>
                      <td className={TABLE_CELL}>
                        <p className="font-medium">{line.resourceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.resourceCode} · {line.unitOfMeasure}
                        </p>
                      </td>
                      <td className={cn(TABLE_CELL, "tabular-nums font-medium")}>
                        {formatEtb(line.rateEtb)}
                      </td>
                      <td className={cn(TABLE_CELL, "tabular-nums text-muted-foreground")}>
                        {formatEtb(line.benchmarkFarmARate)} / {formatEtb(line.benchmarkFarmBRate)}
                      </td>
                      <td className={TABLE_CELL}>
                        <span className="tabular-nums">{formatPct(line.variancePct)}</span>
                        {line.isFlagged ? (
                          <Badge
                            variant="outline"
                            className="ml-1 border-amber-500/40 bg-amber-500/10 text-amber-800"
                          >
                            Flagged
                          </Badge>
                        ) : null}
                      </td>
                      <td className={cn(TABLE_CELL, "max-w-[14rem] text-xs text-muted-foreground")}>
                        {line.spxJustificationNote || "—"}
                      </td>
                      <td className={TABLE_CELL}>
                        <div className="flex min-w-[14rem] flex-col gap-2">
                          <Button size="sm" disabled={approve.isPending} onClick={() => onApprove(line.id)}>
                            Approve
                          </Button>
                          <Input
                            id={`return-${line.id}`}
                            placeholder="Return comment"
                            value={returnComment[line.id] ?? ""}
                            onChange={(e) =>
                              setReturnComment((prev) => ({ ...prev, [line.id]: e.target.value }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={returnLine.isPending || !returnComment[line.id]?.trim()}
                            onClick={() => onReturn(line.id)}
                          >
                            Return
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-3">
          <FilterToolbar>
            <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-[2.15rem] h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="rc-approved-search"
                label="Search"
                placeholder="Code, name…"
                value={approvedSearch}
                onChange={(e) => setApprovedSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              id="rc-approved-type"
              label="Type"
              value={approvedType}
              onChange={(e) => setApprovedType(e.target.value as TypeFilter)}
              className="w-36"
            >
              <option value="all">All</option>
              <option value="material">Material</option>
              <option value="service">Service</option>
            </Select>
          </FilterToolbar>
          <TableShell
            footer={
              <SimplePagination
                page={approvedPage.page}
                pageSize={approvedPage.pageSize}
                total={approvedPage.total}
                pageCount={approvedPage.pageCount}
                onPageChange={approvedPage.setPage}
                onPageSizeChange={approvedPage.setPageSize}
              />
            }
          >
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className={TABLE_HEAD}>
                  <th className={TABLE_CELL}>Code</th>
                  <th className={TABLE_CELL}>Resource</th>
                  <th className={TABLE_CELL}>Rate</th>
                  <th className={TABLE_CELL}>Version</th>
                  <th className={TABLE_CELL}>Approved</th>
                </tr>
              </thead>
              <tbody>
                {loadingApproved ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={CheckCircle2} title="Loading approved rates…" />
                    </td>
                  </tr>
                ) : approvedPage.slice.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={Package} title="No approved rates yet" />
                    </td>
                  </tr>
                ) : (
                  approvedPage.slice.map((line) => (
                    <tr key={line.id} className={TABLE_ROW}>
                      <td className={cn(TABLE_CELL, "font-mono text-xs text-muted-foreground")}>
                        {line.resourceCode}
                      </td>
                      <td className={cn(TABLE_CELL, "font-medium")}>{line.resourceName}</td>
                      <td className={cn(TABLE_CELL, "tabular-nums")}>{formatEtb(line.rateEtb)}</td>
                      <td className={TABLE_CELL}>v{line.version}</td>
                      <td className={cn(TABLE_CELL, "text-muted-foreground")}>
                        {line.approvedAt ? new Date(line.approvedAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LaborRateCardsSection() {
  const { data: rows = [], isLoading } = useLaborRateCards();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [farmFilter, setFarmFilter] = useState<string>("all");

  const farmOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      if (!map.has(row.farmEstateId)) {
        map.set(row.farmEstateId, row.farmEstateName || row.farmEstateId);
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const statusOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.status).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (farmFilter !== "all" && row.farmEstateId !== farmFilter) return false;
      return matchesLaborSearch(row, search);
    });
  }, [rows, search, statusFilter, farmFilter]);

  const pagination = useClientPagination(filtered, 10);

  if (isLoading) {
    return <EmptyState icon={Users} title="Loading labor rates…" />;
  }
  if (!rows.length) {
    return <EmptyState icon={Users} title="No labor rate cards" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Labor rates" value={rows.length} tone="sky" />
        <StatTile label="Farms" value={farmOptions.length} />
        <StatTile label="Showing" value={filtered.length} />
      </div>

      <FilterToolbar>
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-[2.15rem] h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="rc-labor-search"
            label="Search"
            placeholder="Farm, activity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          id="rc-labor-farm"
          label="Farm"
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          className="w-48"
        >
          <option value="all">All farms</option>
          {farmOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <Select
          id="rc-labor-status"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="all">All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </FilterToolbar>

      <TableShell
        footer={
          <SimplePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        }
      >
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className={TABLE_HEAD}>
              <th className={TABLE_CELL}>Farm</th>
              <th className={TABLE_CELL}>Activity</th>
              <th className={TABLE_CELL}>Norm</th>
              <th className={TABLE_CELL}>Wage</th>
              <th className={TABLE_CELL}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagination.slice.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState icon={Search} title="No matching labor rates" />
                </td>
              </tr>
            ) : (
              pagination.slice.map((row) => (
                <tr key={row.id} className={TABLE_ROW}>
                  <td className={cn(TABLE_CELL, "font-medium")}>
                    {row.farmEstateName || row.farmEstateId}
                  </td>
                  <td className={TABLE_CELL}>
                    <p className="font-medium">{row.activityName || "—"}</p>
                    <p className="font-mono text-xs text-muted-foreground">{row.activityCode}</p>
                  </td>
                  <td className={cn(TABLE_CELL, "tabular-nums")}>{row.normMandayPerUnit ?? "—"}</td>
                  <td className={cn(TABLE_CELL, "tabular-nums font-medium")}>
                    {formatEtb(row.wageRatePerManday)}
                  </td>
                  <td className={TABLE_CELL}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

export function RateCardPanel() {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const canBuild = isSpx || isSystemAdmin;
  const canApprove = isSilva;
  const { data: meta } = useRateCardMeta();

  if (!canBuild && !canApprove) {
    return <p className="text-sm text-muted-foreground">No access</p>;
  }

  return (
    <Tabs defaultValue="rates" className="space-y-4">
      <TabsList className="h-11 w-full justify-start gap-1 rounded-xl bg-muted/70 p-1 sm:w-auto">
        <TabsTrigger value="rates" className="gap-1.5 rounded-lg px-4 data-[state=active]:shadow-sm">
          <Package className="h-3.5 w-3.5" />
          Material &amp; service
          {meta ? (
            <span className="rounded-md bg-background/80 px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {meta.counts.draft + meta.counts.submitted + meta.counts.approved + meta.counts.returned}
            </span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="labor" className="gap-1.5 rounded-lg px-4 data-[state=active]:shadow-sm">
          <Users className="h-3.5 w-3.5" />
          Labor
          {meta ? (
            <span className="rounded-md bg-background/80 px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {meta.counts.labor}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="rates" className="mt-0 space-y-8">
        {canBuild ? <RateCardBuilder /> : null}
        {canApprove ? <RateCardApprovals /> : null}
      </TabsContent>
      <TabsContent value="labor" className="mt-0">
        <LaborRateCardsSection />
      </TabsContent>
    </Tabs>
  );
}
