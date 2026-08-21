"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { seasonCalendarApi } from "@/lib/api/field-ops";
import { workOrderApi } from "@/lib/api/work-orders";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { isSpxRole, isVendorRole } from "@/lib/config/role-access";
import type { RoleKey } from "@/lib/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select-native";
import { StatusBadge } from "@/components/badges/status-badge";
import { cn } from "@/lib/utils";

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

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  issued: "bg-sky-100 text-sky-900",
  in_progress: "bg-amber-100 text-amber-900",
  complete: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
};

export default function ExecutionCalendarPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const role = (user?.role || "") as RoleKey;
  const canManage = isSpxRole(role);
  const canExecute = isSpxRole(role) || isVendorRole(role);

  const [year, setYear] = useState(String(new Date().getUTCFullYear()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calName, setCalName] = useState("");
  const [discipline, setDiscipline] = useState("Agronomic Operations");
  const [activity, setActivity] = useState("");
  const [weekStart, setWeekStart] = useState("1");
  const [weekEnd, setWeekEnd] = useState("4");
  const [linkedWo, setLinkedWo] = useState("");
  const [error, setError] = useState("");

  const calendarsQuery = useQuery<SeasonCalendar[]>({
    queryKey: ["season-calendars", year],
    queryFn: () => seasonCalendarApi.findAll({ year: Number(year) }),
  });
  const woQuery = useQuery({
    queryKey: ["work-orders-lite"],
    queryFn: () => workOrderApi.findAll(),
  });

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
      }),
    onSuccess: (row) => {
      setSelectedId(row.id);
      setCalName("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not create calendar")),
  });

  const addWindow = useMutation({
    mutationFn: () =>
      seasonCalendarApi.addWindow(selected!.id, {
        operatingDiscipline: discipline,
        activity,
        weekStart: Number(weekStart),
        weekEnd: Number(weekEnd),
        linkedWorkOrderId: linkedWo || undefined,
      }),
    onSuccess: () => {
      setActivity("");
      invalidate();
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not add window")),
  });

  const issue = useMutation({
    mutationFn: (id: string) => seasonCalendarApi.issueWindow(id),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err, "Issue failed")),
  });
  const start = useMutation({
    mutationFn: (id: string) => seasonCalendarApi.startWindow(id),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err, "Start failed")),
  });
  const complete = useMutation({
    mutationFn: (id: string) => seasonCalendarApi.completeWindow(id),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err, "Complete failed")),
  });

  const workOrders = Array.isArray(woQuery.data) ? woQuery.data : [];
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Season calendar</h1>
          <p className="text-sm text-muted-foreground">
            SPX issues seasonal windows; execution partners work against them. Linked to Work Orders where set.
          </p>
        </div>
        <Input
          label="Year"
          type="number"
          className="w-28"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calendarsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : calendars.length === 0 ? (
              <p className="text-sm text-muted-foreground">No calendars for {year}.</p>
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
                  <p className="text-xs text-muted-foreground mt-1">{cal.windows?.length || 0} windows</p>
                </button>
              ))
            )}

            {canManage ? (
              <div className="space-y-2 border-t pt-3">
                <Input
                  label="New calendar name"
                  value={calName}
                  onChange={(e) => setCalName(e.target.value)}
                  placeholder={`${year} operating calendar`}
                />
                <Button className="w-full" onClick={() => createCal.mutate()} disabled={createCal.isPending}>
                  Create calendar
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {selected ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selected.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selected.notes ? (
                    <p className="text-sm text-muted-foreground">{selected.notes}</p>
                  ) : null}

                  <div className="overflow-x-auto">
                    <div className="min-w-[900px] space-y-2">
                      <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}>
                        {weeks.map((w) => (
                          <div key={w} className="text-[9px] text-center text-muted-foreground">
                            {w % 4 === 1 ? w : ""}
                          </div>
                        ))}
                      </div>
                      {(selected.windows || []).map((win) => (
                        <div key={win.id} className="relative h-10 rounded-md bg-muted/40">
                          <div
                            className={cn(
                              "absolute top-1 bottom-1 rounded-sm px-2 flex items-center text-[10px] font-medium truncate",
                              STATUS_COLORS[win.status] || STATUS_COLORS.planned,
                            )}
                            style={{
                              left: `${((win.weekStart - 1) / 52) * 100}%`,
                              width: `${((win.weekEnd - win.weekStart + 1) / 52) * 100}%`,
                            }}
                            title={`${win.activity} (W${win.weekStart}–${win.weekEnd})`}
                          >
                            {win.activity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Windows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(selected.windows || []).map((win) => (
                    <div key={win.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{win.activity}</p>
                          <p className="text-xs text-muted-foreground">
                            {win.operatingDiscipline} · Weeks {win.weekStart}–{win.weekEnd}
                          </p>
                          {win.linkedWorkOrderId ? (
                            <Link
                              href={`/execution/work-orders/${win.linkedWorkOrderId}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {win.linkedWorkOrderId}
                            </Link>
                          ) : null}
                        </div>
                        <StatusBadge status={win.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {canManage && win.status === "planned" ? (
                          <Button size="sm" onClick={() => issue.mutate(win.id)}>
                            Issue to field
                          </Button>
                        ) : null}
                        {canExecute && win.status === "issued" ? (
                          <Button size="sm" variant="secondary" onClick={() => start.mutate(win.id)}>
                            Start
                          </Button>
                        ) : null}
                        {canExecute && (win.status === "issued" || win.status === "in_progress") ? (
                          <Button size="sm" onClick={() => complete.mutate(win.id)}>
                            Complete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {canManage ? (
                    <div className="border-t pt-4 space-y-3">
                      <p className="text-sm font-medium">Add window</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Operating discipline"
                          value={discipline}
                          onChange={(e) => setDiscipline(e.target.value)}
                        />
                        <Input
                          label="Activity"
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                        />
                        <Input
                          label="Week start"
                          type="number"
                          min={1}
                          max={52}
                          value={weekStart}
                          onChange={(e) => setWeekStart(e.target.value)}
                        />
                        <Input
                          label="Week end"
                          type="number"
                          min={1}
                          max={52}
                          value={weekEnd}
                          onChange={(e) => setWeekEnd(e.target.value)}
                        />
                        <NativeSelect
                          label="Linked work order"
                          value={linkedWo}
                          onChange={(e) => setLinkedWo(e.target.value)}
                        >
                          <option value="">Optional</option>
                          {workOrders.map((wo: { id: string; activity: string }) => (
                            <option key={wo.id} value={wo.id}>
                              {wo.id} — {wo.activity}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                      <Button
                        onClick={() => addWindow.mutate()}
                        disabled={addWindow.isPending || !activity.trim()}
                      >
                        Add window
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Select or create a season calendar to view the harvest timeline.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
