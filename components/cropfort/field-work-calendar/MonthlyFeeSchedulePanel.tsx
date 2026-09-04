"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useRole } from "@/hooks/use-role";
import type { FeeScheduleLine } from "@/lib/api/cropfort/field-work-calendar";
import {
  useApproveFeeSchedule,
  useFeeSchedule,
  useSubmitFeeSchedule,
  useUpsertFeeSchedule,
} from "@/hooks/use-field-work-calendar";

function formatEtb(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

type LineDraft = {
  key: string;
  label: string;
  annualFee: string;
  activationMonth: string;
  deferred: boolean;
};

function toDrafts(lines: FeeScheduleLine[]): LineDraft[] {
  return lines.map((l, i) => ({
    key: l.id || `line-${i}`,
    label: l.label,
    annualFee: l.annualFee != null ? String(l.annualFee) : "",
    activationMonth: l.activationMonth != null ? String(l.activationMonth) : "",
    deferred: Boolean(l.deferred),
  }));
}

export function MonthlyFeeSchedulePanel({ farmId }: { farmId: string }) {
  const { isSpx, isSystemAdmin, isSilva } = useRole();
  const canEdit = isSpx || isSystemAdmin;
  const canApprove = isSilva || isSystemAdmin;

  const { data, isLoading, isError, error } = useFeeSchedule(farmId);
  const upsert = useUpsertFeeSchedule(farmId);
  const submit = useSubmitFeeSchedule(farmId);
  const approve = useApproveFeeSchedule(farmId);

  const [confirmedAnnualFee, setConfirmedAnnualFee] = useState<string | null>(null);
  const [lines, setLines] = useState<LineDraft[] | null>(null);

  const feeValue = confirmedAnnualFee ?? (data ? String(data.confirmedAnnualFee) : "0");
  const lineDrafts = lines ?? (data ? toDrafts(data.lines) : []);

  const rollup = data?.monthlyRollup ?? [];

  const dirty = confirmedAnnualFee != null || lines != null;

  const save = () => {
    upsert.mutate(
      {
        confirmedAnnualFee: Number(feeValue) || 0,
        lines: lineDrafts.map((l) => ({
          label: l.label.trim() || "Elective line",
          annualFee: l.annualFee === "" ? null : Number(l.annualFee),
          activationMonth: l.activationMonth === "" ? null : Number(l.activationMonth),
          deferred: l.deferred,
        })),
      },
      {
        onSuccess: () => {
          setConfirmedAnnualFee(null);
          setLines(null);
        },
      },
    );
  };

  const status = data?.status;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading fee schedule…
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {status ? <Badge variant="outline">{status}</Badge> : null}
        {data ? (
          <span className="text-xs text-muted-foreground">v{data.version}</span>
        ) : (
          <span className="text-xs text-muted-foreground">No fee schedule yet — enter assumptions and save.</span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {canEdit ? (
            <>
              <Button size="sm" variant="outline" disabled={!dirty || upsert.isPending} onClick={save}>
                {upsert.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Save draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!data || status !== "draft" || submit.isPending}
                onClick={() => submit.mutate()}
              >
                Submit
              </Button>
            </>
          ) : null}
          {canApprove ? (
            <Button
              size="sm"
              disabled={!data || status !== "submitted" || approve.isPending}
              onClick={() => approve.mutate()}
            >
              Approve
            </Button>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Assumptions</h3>
        <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Confirmed annual fee (ETB)</span>
            <Input
              type="number"
              min={0}
              disabled={!canEdit || (status != null && status !== "draft" && status !== "returned")}
              value={feeValue}
              onChange={(e) => setConfirmedAnnualFee(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Elective / deferred lines</h3>
          {canEdit && (status == null || status === "draft" || status === "returned") ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setLines([
                  ...lineDrafts,
                  {
                    key: `new-${Date.now()}`,
                    label: "",
                    annualFee: "",
                    activationMonth: "1",
                    deferred: false,
                  },
                ])
              }
            >
              <Plus className="mr-1 h-3 w-3" /> Add line
            </Button>
          ) : null}
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2">Annual fee</th>
                <th className="px-3 py-2">Activation month</th>
                <th className="px-3 py-2">Deferred</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {lineDrafts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-muted-foreground">
                    No elective lines.
                  </td>
                </tr>
              ) : (
                lineDrafts.map((line) => (
                  <tr key={line.key} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <Input
                        disabled={!canEdit}
                        value={line.label}
                        onChange={(e) =>
                          setLines(
                            lineDrafts.map((l) =>
                              l.key === line.key ? { ...l, label: e.target.value } : l,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        disabled={!canEdit || line.deferred}
                        value={line.annualFee}
                        onChange={(e) =>
                          setLines(
                            lineDrafts.map((l) =>
                              l.key === line.key ? { ...l, annualFee: e.target.value } : l,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={1}
                        max={36}
                        disabled={!canEdit || line.deferred}
                        value={line.activationMonth}
                        onChange={(e) =>
                          setLines(
                            lineDrafts.map((l) =>
                              l.key === line.key ? { ...l, activationMonth: e.target.value } : l,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={line.deferred}
                        onChange={(e) =>
                          setLines(
                            lineDrafts.map((l) =>
                              l.key === line.key ? { ...l, deferred: e.target.checked } : l,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      {canEdit ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setLines(lineDrafts.filter((l) => l.key !== line.key))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">36-month rollup</h3>
        <div className="max-h-[420px] overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Month</th>
                <th className="px-3 py-2">Label</th>
                <th className="px-3 py-2 text-right">Confirmed</th>
                <th className="px-3 py-2 text-right">Elective</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {rollup.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-muted-foreground">
                    Save a fee schedule to see the rollup.
                  </td>
                </tr>
              ) : (
                rollup.map((m) => (
                  <tr key={m.monthIndex} className="border-b last:border-0">
                    <td className="px-3 py-1.5 tabular-nums">{m.monthIndex}</td>
                    <td className="px-3 py-1.5">{m.monthLabel}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatEtb(m.confirmedFeeEtb)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatEtb(m.electiveFeeEtb)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-medium">{formatEtb(m.feeEtb)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{formatEtb(m.cumulativeFeeEtb)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
