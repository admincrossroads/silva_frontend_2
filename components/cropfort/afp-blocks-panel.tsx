"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  RotateCcw,
  Search,
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
import {
  useAfpBlockLines,
  useApproveAfpBlockLine,
  useCreateAfpBlockLine,
  useReopenAfpBlockLine,
  useReturnAfpBlockLine,
  useSubmitAfpBlockLines,
  useUpdateAfpBlockElection,
} from "@/hooks/use-afp-blocks";
import { useBudgetPreview } from "@/hooks/use-budget-preview";
import { useVendorFarmEstates } from "@/hooks/use-vendor-farm-estates";
import { useActivityMaster } from "@/hooks/use-activity-master";
import type { AfpBlockLine, ElectionStatus } from "@/lib/api/cropfort/afp-blocks";

type StatusFilter = "all" | "draft" | "submitted" | "approved" | "returned";
type ElectionFilter = "all" | ElectionStatus;

const TABLE_HEAD =
  "border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const TABLE_ROW = "border-b last:border-0 align-top transition-colors hover:bg-muted/30";
const TABLE_CELL = "px-3 py-3";

function formatEtb(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function matchesLineSearch(line: AfpBlockLine, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [line.block?.code, line.block?.label, line.blockId, line.activity?.code, line.activity?.name, line.returnedComment]
    .filter((p): p is string => Boolean(p && String(p).trim()))
    .join(" ")
    .toLowerCase()
    .includes(q);
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

function EmptyState({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
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

function AfpBuilder({ year }: { year: number }) {
  const { data: lines = [], isLoading } = useAfpBlockLines({ planYear: year });
  const { data: budget } = useBudgetPreview({ planYear: year });
  const { estates } = useVendorFarmEstates({ status: "active" });
  const { data: activities = [] } = useActivityMaster();
  const createLine = useCreateAfpBlockLine();
  const submit = useSubmitAfpBlockLines();
  const updateElection = useUpdateAfpBlockElection();
  const reopen = useReopenAfpBlockLine();

  const blocks = estates.flatMap((e) => e.blocks.map((b) => ({ ...b, estateName: e.name })));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [electionFilter, setElectionFilter] = useState<ElectionFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [blockId, setBlockId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [plannedQty, setPlannedQty] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    return lines.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (electionFilter !== "all" && l.electionStatus !== electionFilter) return false;
      return matchesLineSearch(l, search);
    });
  }, [lines, statusFilter, electionFilter, search]);

  const pagination = useClientPagination(filtered, 10);

  const draftIds = lines.filter((l) => l.status === "draft").map((l) => l.id);
  const selectedDraftIds = draftIds.filter((id) => selected[id]);
  const submitIds = selectedDraftIds.length ? selectedDraftIds : draftIds;
  const counts = {
    draft: lines.filter((l) => l.status === "draft").length,
    submitted: lines.filter((l) => l.status === "submitted").length,
    approved: lines.filter((l) => l.status === "approved").length,
    returned: lines.filter((l) => l.status === "returned").length,
    elected: lines.filter((l) => l.electionStatus === "elected").length,
  };

  const resetForm = () => {
    setBlockId("");
    setActivityId("");
    setPlannedQty("");
    setPlannedStart("");
    setPlannedEnd("");
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

  const onCreate = async () => {
    setFormError("");
    if (!blockId || !activityId || !plannedQty) {
      setFormError("Block, activity, and planned quantity are required.");
      return;
    }
    try {
      await createLine.mutateAsync({
        planYear: year,
        blockId,
        activityId,
        plannedQty: Number(plannedQty),
        plannedStart: plannedStart || null,
        plannedEnd: plannedEnd || null,
      });
      closeForm();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not create plan line"));
    }
  };

  const onSubmit = async () => {
    setError("");
    if (!submitIds.length) return;
    try {
      await submit.mutateAsync(submitIds);
      setSelected({});
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit plan lines"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Draft" value={counts.draft} />
        <StatTile label="Submitted" value={counts.submitted} tone="amber" />
        <StatTile label="Approved" value={counts.approved} tone="emerald" />
        <StatTile label="Returned" value={counts.returned} tone="rose" />
        <StatTile label="Elected" value={counts.elected} tone="sky" />
        <StatTile label="Budget" value={budget?.totals ? formatEtb(budget.totals.totalCostEtb) : "—"} />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add line
        </Button>
        <Button disabled={!submitIds.length || submit.isPending} onClick={onSubmit} className="gap-1.5">
          <ClipboardList className="h-4 w-4" />
          Submit {selectedDraftIds.length ? selectedDraftIds.length : draftIds.length || ""} drafts
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Modal open={formOpen} onClose={closeForm} title="Add line" className="sm:max-w-lg">
        <div className="space-y-4">
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Select id="blockId" label="Block" value={blockId} onChange={(e) => setBlockId(e.target.value)}>
              <option value="">Select…</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.estateName}
                </option>
              ))}
            </Select>
            <Select
              id="activityId"
              label="Activity"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
            >
              <option value="">Select…</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </Select>
            <Input
              id="plannedQty"
              label="Qty"
              type="number"
              min="0"
              step="0.01"
              value={plannedQty}
              onChange={(e) => setPlannedQty(e.target.value)}
            />
            <Input
              id="plannedStart"
              label="Start"
              type="date"
              value={plannedStart}
              onChange={(e) => setPlannedStart(e.target.value)}
            />
            <Input
              id="plannedEnd"
              label="End"
              type="date"
              value={plannedEnd}
              onChange={(e) => setPlannedEnd(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button disabled={createLine.isPending} onClick={onCreate}>
              Add
            </Button>
          </div>
        </div>
      </Modal>

      <FilterToolbar>
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-[2.15rem] h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="afp-search"
            label="Search"
            placeholder="Block, activity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          id="afp-filter"
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
          id="afp-election-filter"
          label="Election"
          value={electionFilter}
          onChange={(e) => setElectionFilter(e.target.value as ElectionFilter)}
          className="w-36"
        >
          <option value="all">All</option>
          <option value="suggested">Suggested</option>
          <option value="elected">Elected</option>
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
              <th className={TABLE_CELL}>Block</th>
              <th className={TABLE_CELL}>Activity</th>
              <th className={TABLE_CELL}>Qty</th>
              <th className={TABLE_CELL}>Window</th>
              <th className={TABLE_CELL}>Election</th>
              <th className={TABLE_CELL}>Status</th>
              <th className={TABLE_CELL} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon={FileText} title="Loading…" />
                </td>
              </tr>
            ) : pagination.slice.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon={FileText} title="No matching lines" />
                </td>
              </tr>
            ) : (
              pagination.slice.map((line) => (
                <PlanLineRow
                  key={line.id}
                  line={line}
                  selected={Boolean(selected[line.id])}
                  onSelect={(checked) => setSelected((prev) => ({ ...prev, [line.id]: checked }))}
                  onElect={() => updateElection.mutate({ lineId: line.id, electionStatus: "elected" })}
                  electPending={updateElection.isPending}
                  onReopen={() => reopen.mutate(line.id)}
                  reopenPending={reopen.isPending}
                />
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

function PlanLineRow({
  line,
  selected,
  onSelect,
  onElect,
  electPending,
  onReopen,
  reopenPending,
}: {
  line: AfpBlockLine;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onElect: () => void;
  electPending: boolean;
  onReopen: () => void;
  reopenPending: boolean;
}) {
  return (
    <tr className={TABLE_ROW}>
      <td className={TABLE_CELL}>
        {line.status === "draft" ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            aria-label={`Select ${line.block?.code ?? line.blockId}`}
            className="h-4 w-4 rounded border-border"
          />
        ) : null}
      </td>
      <td className={TABLE_CELL}>
        <p className="font-medium">{line.block?.code ?? line.blockId}</p>
        {line.block?.label ? <p className="text-xs text-muted-foreground">{line.block.label}</p> : null}
      </td>
      <td className={TABLE_CELL}>
        <p className="font-medium">{line.activity?.name ?? "—"}</p>
        <p className="font-mono text-xs text-muted-foreground">{line.activity?.code}</p>
        {line.returnedComment ? (
          <p className="mt-1 text-xs text-destructive">{line.returnedComment}</p>
        ) : null}
      </td>
      <td className={cn(TABLE_CELL, "tabular-nums font-medium")}>{line.plannedQty}</td>
      <td className={cn(TABLE_CELL, "text-xs text-muted-foreground")}>
        {line.plannedStart ? new Date(line.plannedStart).toLocaleDateString() : "—"}
        {" → "}
        {line.plannedEnd ? new Date(line.plannedEnd).toLocaleDateString() : "—"}
      </td>
      <td className={TABLE_CELL}>
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            line.electionStatus === "elected"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
              : "border-border bg-muted/60 text-muted-foreground",
          )}
        >
          {line.electionStatus}
        </Badge>
      </td>
      <td className={TABLE_CELL}>
        <StatusBadge status={line.status} />
      </td>
      <td className={cn(TABLE_CELL, "text-right")}>
        {line.electionStatus === "suggested" && (line.status === "draft" || line.status === "returned") ? (
          <Button size="sm" variant="ghost" disabled={electPending} onClick={onElect}>
            Elect
          </Button>
        ) : null}
        {line.status === "returned" ? (
          <Button size="sm" variant="outline" disabled={reopenPending} onClick={onReopen}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reopen
          </Button>
        ) : null}
      </td>
    </tr>
  );
}

function AfpApprovals({ year }: { year: number }) {
  const { data: submitted = [], isLoading: loadingSubmitted } = useAfpBlockLines({
    planYear: year,
    status: "submitted",
  });
  const { data: approved = [], isLoading: loadingApproved } = useAfpBlockLines({
    planYear: year,
    status: "approved",
  });
  const approve = useApproveAfpBlockLine();
  const returnLine = useReturnAfpBlockLine();
  const [returnComment, setReturnComment] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [approvedSearch, setApprovedSearch] = useState("");

  const pendingFiltered = useMemo(
    () => submitted.filter((l) => matchesLineSearch(l, pendingSearch)),
    [submitted, pendingSearch],
  );
  const approvedFiltered = useMemo(
    () => approved.filter((l) => matchesLineSearch(l, approvedSearch)),
    [approved, approvedSearch],
  );

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
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Pending review" value={submitted.length} tone="amber" />
        <StatTile label="Approved lines" value={approved.length} tone="emerald" />
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
                id="afp-pending-search"
                label="Search"
                placeholder="Block, activity…"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="pl-9"
              />
            </div>
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
                  <th className={TABLE_CELL}>Block / activity</th>
                  <th className={TABLE_CELL}>Qty</th>
                  <th className={TABLE_CELL}>Election</th>
                  <th className={TABLE_CELL}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingSubmitted ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={ClipboardList} title="Loading…" />
                    </td>
                  </tr>
                ) : pendingPage.slice.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={CheckCircle2} title="Nothing pending" />
                    </td>
                  </tr>
                ) : (
                  pendingPage.slice.map((line) => (
                    <tr key={line.id} className={TABLE_ROW}>
                      <td className={TABLE_CELL}>
                        <p className="font-medium">{line.block?.code ?? line.blockId}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.activity?.code} — {line.activity?.name}
                        </p>
                      </td>
                      <td className={cn(TABLE_CELL, "tabular-nums font-medium")}>{line.plannedQty}</td>
                      <td className={cn(TABLE_CELL, "capitalize")}>{line.electionStatus}</td>
                      <td className={TABLE_CELL}>
                        <div className="flex min-w-[14rem] flex-col gap-2">
                          <Button size="sm" disabled={approve.isPending} onClick={() => onApprove(line.id)}>
                            Approve
                          </Button>
                          <Input
                            id={`afp-return-${line.id}`}
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
                id="afp-approved-search"
                label="Search"
                placeholder="Block, activity…"
                value={approvedSearch}
                onChange={(e) => setApprovedSearch(e.target.value)}
                className="pl-9"
              />
            </div>
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
                  <th className={TABLE_CELL}>Block</th>
                  <th className={TABLE_CELL}>Activity</th>
                  <th className={TABLE_CELL}>Qty</th>
                  <th className={TABLE_CELL}>Version</th>
                  <th className={TABLE_CELL}>Approved</th>
                </tr>
              </thead>
              <tbody>
                {loadingApproved ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={CheckCircle2} title="Loading…" />
                    </td>
                  </tr>
                ) : approvedPage.slice.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={FileText} title="No approved lines" />
                    </td>
                  </tr>
                ) : (
                  approvedPage.slice.map((line) => (
                    <tr key={line.id} className={TABLE_ROW}>
                      <td className={cn(TABLE_CELL, "font-medium")}>
                        {line.block?.code ?? line.blockId}
                      </td>
                      <td className={TABLE_CELL}>{line.activity?.name ?? "—"}</td>
                      <td className={cn(TABLE_CELL, "tabular-nums")}>{line.plannedQty}</td>
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

export function AfpBlocksPanel({ planYear }: { planYear?: number } = {}) {
  const { isSilva, isSpx, isSystemAdmin } = useRole();
  const year = planYear ?? new Date().getUTCFullYear();
  const canBuild = isSpx || isSystemAdmin;
  const canApprove = isSilva;

  if (!canBuild && !canApprove) {
    return <p className="text-sm text-muted-foreground">No access</p>;
  }

  return (
    <div className="space-y-8">
      {canBuild ? <AfpBuilder year={year} /> : null}
      {canApprove ? <AfpApprovals year={year} /> : null}
    </div>
  );
}
