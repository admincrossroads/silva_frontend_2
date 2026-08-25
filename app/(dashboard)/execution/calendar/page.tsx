"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { seasonCalendarApi } from "@/lib/api/field-ops";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { useRole } from "@/hooks/use-role";
import {
  InteractiveSeasonTimeline,
  SeasonStatusLegend,
} from "@/components/calendar/interactive-season-timeline";
import { isWindowEditable } from "@/components/calendar/season-calendar-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader, PageFilters, PageContent } from "@/components/layout/page-shell";

type SeasonWindow = {
  id: string;
  operatingDiscipline: string;
  activity: string;
  weekStart: number;
  weekEnd: number;
  status: string;
  linkedWorkOrderId: string | null;
  notes: string | null;
};

type SeasonCalendar = {
  id: string;
  year: number;
  name: string;
  status: string;
  notes: string | null;
  windows: SeasonWindow[];
};

type WindowFormState = {
  operatingDiscipline: string;
  activity: string;
  weekStart: string;
  weekEnd: string;
  linkedWorkOrderId: string;
  notes: string;
};

const DISCIPLINES = [
  "Agronomic Operations",
  "Harvest & Processing",
  "Infrastructure",
  "Safety & Compliance",
];

const EMPTY_WINDOW_FORM: WindowFormState = {
  operatingDiscipline: "Agronomic Operations",
  activity: "",
  weekStart: "1",
  weekEnd: "4",
  linkedWorkOrderId: "",
  notes: "",
};

function windowToForm(win: SeasonWindow): WindowFormState {
  return {
    operatingDiscipline: win.operatingDiscipline,
    activity: win.activity,
    weekStart: String(win.weekStart),
    weekEnd: String(win.weekEnd),
    linkedWorkOrderId: win.linkedWorkOrderId ?? "",
    notes: win.notes ?? "",
  };
}

export default function ExecutionCalendarPage() {
  const qc = useQueryClient();
  const { isSpx, isSystemAdmin, isVendor } = useRole();
  const canManage = isSpx || isSystemAdmin;
  const canExecute = isVendor;

  const [year, setYear] = useState(String(new Date().getUTCFullYear()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [calModalOpen, setCalModalOpen] = useState(false);
  const [calName, setCalName] = useState("");
  const [calNotes, setCalNotes] = useState("");

  const [windowModalOpen, setWindowModalOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<SeasonWindow | null>(null);
  const [windowForm, setWindowForm] = useState<WindowFormState>(EMPTY_WINDOW_FORM);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const calendarsQuery = useQuery<SeasonCalendar[]>({
    queryKey: ["season-calendars", year],
    queryFn: () => seasonCalendarApi.findAll({ year: Number(year) }),
  });
  const { data: workOrders = [] } = useWorkOrders();

  const calendars = calendarsQuery.data ?? [];
  const selected = useMemo(() => {
    if (!calendars.length) return null;
    return calendars.find((c) => c.id === selectedId) || calendars[0];
  }, [calendars, selectedId]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["season-calendars"] });

  const createCal = useMutation({
    mutationFn: () =>
      seasonCalendarApi.create({
        year: Number(year),
        name: calName || `${year} operating calendar`,
        notes: calNotes || undefined,
      }),
    meta: { successMessage: "Calendar created", errorMessage: "Could not create calendar" },
    onSuccess: (row) => {
      setSelectedId(row.id);
      setCalName("");
      setCalNotes("");
      setCalModalOpen(false);
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create calendar")),
  });

  const saveWindow = useMutation({
    mutationFn: () => {
      const body = {
        operatingDiscipline: windowForm.operatingDiscipline,
        activity: windowForm.activity,
        weekStart: Number(windowForm.weekStart),
        weekEnd: Number(windowForm.weekEnd),
        linkedWorkOrderId: windowForm.linkedWorkOrderId || undefined,
        notes: windowForm.notes || undefined,
      };
      if (editingWindow) {
        return seasonCalendarApi.updateWindow(editingWindow.id, body);
      }
      return seasonCalendarApi.addWindow(selected!.id, body);
    },
    meta: { successMessage: "Window saved", errorMessage: "Could not save window" },
    onSuccess: () => {
      setWindowModalOpen(false);
      setEditingWindow(null);
      setWindowForm(EMPTY_WINDOW_FORM);
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not save window")),
  });

  const issue = useMutation({
    mutationFn: (id: string) => seasonCalendarApi.issueWindow(id),
    meta: { successMessage: "Window issued", errorMessage: "Issue failed" },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Issue failed")),
  });
  const start = useMutation({
    mutationFn: (id: string) => seasonCalendarApi.startWindow(id),
    meta: { successMessage: "Window started", errorMessage: "Start failed" },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Start failed")),
  });
  const complete = useMutation({
    mutationFn: (id: string) => seasonCalendarApi.completeWindow(id),
    meta: { successMessage: "Window completed", errorMessage: "Complete failed" },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Complete failed")),
  });

  const resizeWindow = useMutation({
    mutationFn: ({ id, weekStart, weekEnd }: { id: string; weekStart: number; weekEnd: number }) =>
      seasonCalendarApi.updateWindow(id, { weekStart, weekEnd }),
    meta: { successMessage: "Window dates updated", errorMessage: "Could not update window dates" },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not update window dates")),
  });

  const openCreateWindow = (weekStart?: number, weekEnd?: number) => {
    setEditingWindow(null);
    setWindowForm({
      ...EMPTY_WINDOW_FORM,
      weekStart: weekStart ? String(weekStart) : EMPTY_WINDOW_FORM.weekStart,
      weekEnd: weekEnd ? String(weekEnd) : EMPTY_WINDOW_FORM.weekEnd,
    });
    setError("");
    setWindowModalOpen(true);
  };

  const openEditWindow = (win: SeasonWindow) => {
    setSelectedWindowId(win.id);
    setEditingWindow(win);
    setWindowForm(windowToForm(win));
    setError("");
    setWindowModalOpen(true);
  };

  const handleSelectWindow = (id: string | null) => {
    setSelectedWindowId(id);
    if (id && rowRefs.current[id]) {
      rowRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    setSelectedWindowId(null);
  }, [selected?.id]);

  const windows = selected?.windows ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Season calendar"
        description="SPX lays out week windows for prune, fertilize, harvest, and infra then issues them to the field. Vendors start and complete against issued windows."
        actions={
          canManage ? (
            <Button onClick={() => setCalModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New calendar
            </Button>
          ) : undefined
        }
      />

      <PageFilters>
        <Input
          label="Year"
          type="number"
          className="w-28"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </PageFilters>

      {error && !calModalOpen && !windowModalOpen ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3 xl:gap-8 2xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {calendarsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : calendars.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No calendars for {year}.
                  {canManage ? " Create one to plan the harvest timeline." : null}
                </p>
              ) : (
                calendars.map((cal) => (
                  <button
                    key={cal.id}
                    type="button"
                    onClick={() => setSelectedId(cal.id)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left text-sm",
                      selected?.id === cal.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{cal.name}</span>
                      <StatusBadge status={cal.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cal.windows?.length || 0} windows · {cal.year}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2 2xl:col-span-1 xl:space-y-8">
            {selected ? (
              <>
                <Card>
                  <CardHeader className="flex flex-col items-stretch gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-base break-words">{selected.name}</CardTitle>
                      {selected.notes ? (
                        <p className="text-sm text-muted-foreground">{selected.notes}</p>
                      ) : null}
                    </div>
                    <StatusBadge status={selected.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SeasonStatusLegend />
                    <InteractiveSeasonTimeline
                      windows={windows}
                      selectedWindowId={selectedWindowId}
                      onSelectWindow={handleSelectWindow}
                      editable={canManage}
                      onWindowChange={(id, weekStart, weekEnd) =>
                        resizeWindow.mutate({ id, weekStart, weekEnd })
                      }
                      onRangeSelect={(weekStart, weekEnd) => openCreateWindow(weekStart, weekEnd)}
                      onWindowOpen={(win) => {
                        if (canManage && isWindowEditable(win.status)) openEditWindow(win as SeasonWindow);
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <CardTitle className="text-base">Windows</CardTitle>
                    {canManage ? (
                      <Button size="sm" className="w-full sm:w-auto" onClick={() => openCreateWindow()}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add window
                      </Button>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    {windows.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No windows yet.
                        {canManage ? " Add activities across the 52-week season." : null}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Activity</TableHead>
                              <TableHead>Discipline</TableHead>
                              <TableHead>Weeks</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Work order</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {windows.map((win) => {
                              const editable =
                                canManage && (win.status === "planned" || win.status === "issued");
                              return (
                                <TableRow
                                  key={win.id}
                                  ref={(el) => {
                                    rowRefs.current[win.id] = el;
                                  }}
                                  className={cn(
                                    "cursor-pointer",
                                    selectedWindowId === win.id && "bg-primary/5",
                                  )}
                                  onClick={() => handleSelectWindow(win.id)}
                                >
                                  <TableCell className="max-w-[180px] truncate font-medium">
                                    {win.activity}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">{win.operatingDiscipline}</TableCell>
                                  <TableCell className="tabular-nums">
                                    W{win.weekStart}–{win.weekEnd}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge status={win.status} />
                                  </TableCell>
                                  <TableCell>
                                    {win.linkedWorkOrderId ? (
                                      <Link
                                        href={`/execution/work-orders/${win.linkedWorkOrderId}`}
                                        className="font-mono text-xs text-primary hover:underline"
                                      >
                                        {win.linkedWorkOrderId}
                                      </Link>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                      {editable ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditWindow(win);
                                          }}
                                        >
                                          Edit
                                        </Button>
                                      ) : null}
                                      {canManage && win.status === "planned" ? (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            issue.mutate(win.id);
                                          }}
                                        >
                                          Issue
                                        </Button>
                                      ) : null}
                                      {canExecute && win.status === "issued" ? (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            start.mutate(win.id);
                                          }}
                                        >
                                          Start
                                        </Button>
                                      ) : null}
                                      {canExecute &&
                                      (win.status === "issued" || win.status === "in_progress") ? (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            complete.mutate(win.id);
                                          }}
                                        >
                                          Complete
                                        </Button>
                                      ) : null}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  {canManage
                    ? "Create a season calendar to lay out the harvest timeline."
                    : "No season calendar is available for this year yet."}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageContent>

      <Modal
        open={calModalOpen}
        onClose={() => {
          setCalModalOpen(false);
          setError("");
        }}
        title="New season calendar"
        description={`Plan operating windows for ${year}.`}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createCal.mutate();
          }}
        >
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Input
            label="Calendar name"
            value={calName}
            onChange={(e) => setCalName(e.target.value)}
            placeholder={`${year} operating calendar`}
            required
          />
          <Input
            label="Notes (optional)"
            value={calNotes}
            onChange={(e) => setCalNotes(e.target.value)}
            placeholder="SPX-issued seasonal windows for field execution."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCal.isPending}>
              {createCal.isPending ? "Creating…" : "Create calendar"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={windowModalOpen}
        onClose={() => {
          setWindowModalOpen(false);
          setEditingWindow(null);
          setError("");
        }}
        title={editingWindow ? "Edit window" : "Add window"}
        description="Link optional work orders so field crews can trace calendar windows to issued work."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveWindow.mutate();
          }}
        >
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Select
            label="Operating discipline"
            value={windowForm.operatingDiscipline}
            onChange={(e) => setWindowForm((f) => ({ ...f, operatingDiscipline: e.target.value }))}
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Input
            label="Activity"
            value={windowForm.activity}
            onChange={(e) => setWindowForm((f) => ({ ...f, activity: e.target.value }))}
            placeholder="Farm-wide pruning & topping"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Week start"
              type="number"
              min={1}
              max={52}
              value={windowForm.weekStart}
              onChange={(e) => setWindowForm((f) => ({ ...f, weekStart: e.target.value }))}
              required
            />
            <Input
              label="Week end"
              type="number"
              min={1}
              max={52}
              value={windowForm.weekEnd}
              onChange={(e) => setWindowForm((f) => ({ ...f, weekEnd: e.target.value }))}
              required
            />
          </div>

          <Select
            label="Linked work order"
            value={windowForm.linkedWorkOrderId}
            onChange={(e) => setWindowForm((f) => ({ ...f, linkedWorkOrderId: e.target.value }))}
          >
            <option value="">Optional</option>
            {workOrders.map((wo) => (
              <option key={wo.id} value={wo.id}>
                {wo.id} — {wo.activity}
              </option>
            ))}
          </Select>

          <Input
            label="Notes (optional)"
            value={windowForm.notes}
            onChange={(e) => setWindowForm((f) => ({ ...f, notes: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setWindowModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveWindow.isPending || !windowForm.activity.trim() || !selected}
            >
              {saveWindow.isPending
                ? "Saving…"
                : editingWindow
                  ? "Save changes"
                  : "Add window"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
