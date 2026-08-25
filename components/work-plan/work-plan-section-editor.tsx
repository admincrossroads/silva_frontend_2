"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, SkipForward, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  applyNetAreaFrequency,
  BUDGET_MONTHS,
  MONTH_LABELS,
  createCustomActivity,
  recomputeActivity,
  sectionTotals,
  setAnnualQuantity,
  setMonthQuantity,
  SCOPE_FIELDS,
  type WorkPlanActivityDraft,
  type WorkPlanSectionDraft,
} from "@/lib/work-plan/builder";

type Props = {
  section: WorkPlanSectionDraft;
  farmBlocks: string[];
  onChange: (section: WorkPlanSectionDraft) => void;
  readOnly?: boolean;
};

const COMMON_UNITS = ["ha", "m3", "bed", "kg", "No", "Load", "m2", "month", "unit"];

export function WorkPlanSectionEditor({ section, farmBlocks, onChange, readOnly }: Props) {
  const totals = sectionTotals(section);
  const scopeFields = SCOPE_FIELDS[section.sectionCode] || [];
  const isSalary = section.sectionCode === "salary";
  const [step, setStep] = useState(0);
  const [showNorms, setShowNorms] = useState(false);
  const [showMonths, setShowMonths] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameAm, setNewNameAm] = useState("");
  const [newUnit, setNewUnit] = useState("ha");
  const [newQty, setNewQty] = useState("");
  const [newMdUnit, setNewMdUnit] = useState("1");
  const [newWage, setNewWage] = useState("50");

  const activities = section.activities;
  const activeCount = activities.filter((a) => a.enabled).length;

  useEffect(() => {
    setStep(0);
    setShowNorms(false);
    setShowMonths(false);
    setAdding(false);
  }, [section.sectionCode]);

  useEffect(() => {
    if (activities.length === 0) setStep(0);
    else if (step >= activities.length) setStep(Math.max(0, activities.length - 1));
  }, [activities.length, step]);

  const current = activities[step] ? recomputeActivity(activities[step]) : null;
  const progress = activities.length ? Math.round(((step + 1) / activities.length) * 100) : 0;

  const doneIds = useMemo(
    () =>
      new Set(
        activities
          .filter((a) => a.enabled && ((a.annualQuantity || 0) > 0 || (a.annualCostEtb || 0) > 0))
          .map((a) => a.id),
      ),
    [activities],
  );

  const toggleBlock = (code: string) => {
    if (readOnly) return;
    const blocks = section.scope.blocks || [];
    const next = blocks.includes(code) ? blocks.filter((b) => b !== code) : [...blocks, code].sort();
    onChange({ ...section, scope: { ...section.scope, blocks: next } });
  };

  const updateScope = (key: keyof typeof section.scope, value: number | undefined) => {
    if (readOnly) return;
    onChange({ ...section, scope: { ...section.scope, [key]: value } });
  };

  const replaceActivity = (id: string, next: WorkPlanActivityDraft) => {
    onChange({
      ...section,
      enabled: true,
      activities: section.activities.map((a) => (a.id === id ? next : a)),
    });
  };

  const patchActivity = (id: string, patch: Partial<WorkPlanActivityDraft>) => {
    if (readOnly) return;
    const currentAct = section.activities.find((a) => a.id === id);
    if (!currentAct) return;

    let merged: WorkPlanActivityDraft = { ...currentAct, ...patch };

    if (isSalary) {
      if (patch.enabled === false) {
        merged = { ...merged, annualQuantity: 0, annualMandays: 0, annualCostEtb: 0 };
      }
      replaceActivity(id, merged);
      return;
    }

    if (patch.enabled === true && !currentAct.enabled) {
      merged.annualQuantity = merged.annualQuantity || merged.suggestedQuantity || 0;
    }

    if (patch.netArea !== undefined || patch.frequency !== undefined) {
      merged = applyNetAreaFrequency(merged);
    } else if (patch.annualQuantity !== undefined) {
      merged = setAnnualQuantity(merged, patch.annualQuantity ?? 0);
    } else if (patch.enabled === false) {
      merged = {
        ...recomputeActivity(merged),
        enabled: false,
        annualQuantity: 0,
        annualMandays: 0,
        annualCostEtb: 0,
      };
    } else {
      merged = recomputeActivity(merged);
    }

    replaceActivity(id, merged);
  };

  const addCustomActivity = () => {
    if (readOnly || !newName.trim()) return;
    const created = createCustomActivity(section.sectionCode, section.activities, {
      nameEn: newName,
      nameAm: newNameAm,
      unit: newUnit,
      annualQuantity: Number(newQty) || 0,
      normMdPerUnit: Number(newMdUnit) || 1,
      normWageEtb: Number(newWage) || 50,
    });
    const nextActivities = [...section.activities, created];
    onChange({ ...section, enabled: true, activities: nextActivities });
    setStep(nextActivities.length - 1);
    setNewName("");
    setNewNameAm("");
    setNewQty("");
    setNewUnit("ha");
    setNewMdUnit("1");
    setNewWage("50");
    setAdding(false);
    setShowNorms(false);
    setShowMonths(false);
  };

  const removeActivity = (id: string) => {
    if (readOnly) return;
    const nextActivities = section.activities.filter((a) => a.id !== id);
    onChange({ ...section, activities: nextActivities });
    setStep((s) => Math.min(s, Math.max(0, nextActivities.length - 1)));
  };

  const goNext = () => setStep((s) => Math.min(activities.length - 1, s + 1));
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const includeAndNext = () => {
    if (!current || readOnly) return;
    if (!current.enabled) {
      patchActivity(current.id, {
        enabled: true,
        annualQuantity: current.annualQuantity || current.suggestedQuantity || 0,
      });
    }
    goNext();
  };

  const skipActivity = () => {
    if (!current || readOnly) return;
    patchActivity(current.id, { enabled: false });
    goNext();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{section.sectionLabel}</h3>
          <p className="text-xs text-muted-foreground">
            {activeCount} included · {totals.mandays.toLocaleString()} MD ·{" "}
            <span className="font-medium text-foreground">{totals.costEtb.toLocaleString()} ETB</span>
          </p>
        </div>
        {!readOnly ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={(e) => onChange({ ...section, enabled: e.target.checked })}
              className="rounded border-input"
            />
            Include this section
          </label>
        ) : null}
      </div>

      {!isSalary ? (
        <div className="rounded-xl border bg-muted/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Section scope</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {farmBlocks.map((code) => {
              const selected = (section.scope.blocks || []).includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  disabled={readOnly || !section.enabled}
                  onClick={() => toggleBlock(code)}
                  className={cn(
                    "h-9 min-w-9 rounded-md border px-3 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted",
                    (!section.enabled || readOnly) && "pointer-events-none opacity-50",
                  )}
                >
                  {code}
                </button>
              );
            })}
          </div>
          {scopeFields.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {scopeFields.map((field) => (
                <Input
                  key={field.key}
                  id={`${section.sectionCode}-${field.key}`}
                  label={field.label}
                  type="number"
                  step={field.step || "1"}
                  disabled={!section.enabled || readOnly}
                  value={section.scope[field.key] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    updateScope(field.key, v);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {!section.enabled ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Include this section to continue.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="flex max-h-[520px] flex-col rounded-xl border bg-card p-2">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Activities
            </p>
            <ol className="flex-1 space-y-0.5 overflow-y-auto">
              {activities.length === 0 ? (
                <li className="px-2 py-4 text-xs text-muted-foreground">No activities yet.</li>
              ) : (
                activities.map((a, i) => {
                  const done = doneIds.has(a.id);
                  const selected = i === step;
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(i);
                          setAdding(false);
                          setShowNorms(false);
                          setShowMonths(false);
                        }}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors",
                          selected ? "bg-primary/10 text-foreground" : "hover:bg-muted/60",
                          !a.enabled && "opacity-50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                            done
                              ? "border-primary bg-primary text-primary-foreground"
                              : selected
                                ? "border-primary text-primary"
                                : "border-muted-foreground/30 text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-medium leading-snug">{a.nameEn}</span>
                          {a.enabled && (a.annualCostEtb || 0) > 0 ? (
                            <span className="mt-0.5 block tabular-nums text-muted-foreground">
                              {(a.annualCostEtb || 0).toLocaleString()} ETB
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ol>
            {!readOnly ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => {
                  setAdding(true);
                  onChange({ ...section, enabled: true });
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add activity
              </Button>
            ) : null}
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            {adding && !readOnly ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">Add activity</h4>
                </div>
                <Input
                  label="Activity name (English)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Land clearing"
                />
                <Input
                  label="Activity name (Amharic, optional)"
                  value={newNameAm}
                  onChange={(e) => setNewNameAm(e.target.value)}
                  placeholder="መሬት ማጽዳት"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Unit</label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    >
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Annual quantity"
                    type="number"
                    min={0}
                    step="any"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="0.4"
                  />
                  <Input
                    label="md / unit"
                    type="number"
                    min={0}
                    step="any"
                    value={newMdUnit}
                    onChange={(e) => setNewMdUnit(e.target.value)}
                  />
                  <Input
                    label="Wage rate (ETB)"
                    type="number"
                    min={0}
                    step="any"
                    value={newWage}
                    onChange={(e) => setNewWage(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                  <Button type="button" disabled={!newName.trim()} onClick={addCustomActivity}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add to plan
                  </Button>
                </div>
              </div>
            ) : !current ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No activities in this section yet.</p>
                {!readOnly ? (
                  <Button type="button" className="mt-4" onClick={() => setAdding(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add your first activity
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Activity {step + 1} of {activities.length}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold leading-snug">{current.nameEn}</h4>
                      {current.nameAm ? (
                        <p className="text-sm text-muted-foreground">{current.nameAm}</p>
                      ) : null}
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {current.id} · Unit: {current.unit}
                      </p>
                    </div>
                    {!readOnly ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeActivity(current.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>

                <label className="mb-4 flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={current.enabled}
                    disabled={readOnly}
                    onChange={(e) => {
                      if (e.target.checked) {
                        patchActivity(current.id, {
                          enabled: true,
                          annualQuantity: current.annualQuantity || current.suggestedQuantity || 0,
                        });
                      } else {
                        patchActivity(current.id, { enabled: false });
                      }
                    }}
                    className="rounded border-input"
                  />
                  Include this activity in the plan
                </label>

                {current.enabled ? (
                  <div className="space-y-4">
                    {isSalary ? (
                      <Input
                        label="Annual cost (ETB)"
                        type="number"
                        min={0}
                        disabled={readOnly}
                        value={current.annualCostEtb ?? ""}
                        onChange={(e) =>
                          patchActivity(current.id, {
                            annualCostEtb: Number(e.target.value) || 0,
                            annualMandays: 0,
                          })
                        }
                      />
                    ) : (
                      <>
                        <Input
                          label={`Annual quantity (${current.unit})`}
                          type="number"
                          min={0}
                          step="any"
                          disabled={readOnly}
                          value={current.annualQuantity ?? ""}
                          onChange={(e) =>
                            patchActivity(current.id, { annualQuantity: Number(e.target.value) || 0 })
                          }
                        />

                        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              Man-days
                            </p>
                            <p className="mt-0.5 text-xl font-semibold tabular-nums">
                              {(current.annualMandays || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Cost</p>
                            <p className="mt-0.5 text-xl font-semibold tabular-nums text-red-700">
                              {(current.annualCostEtb || 0).toLocaleString()} ETB
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => setShowNorms((v) => !v)}>
                            {showNorms ? "Hide norms" : "Edit norms (wage, md/unit…)"}
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setShowMonths((v) => !v)}>
                            {showMonths ? "Hide months" : "Split by month (optional)"}
                          </Button>
                        </div>

                        {showNorms ? (
                          <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                            <Input
                              label="md / unit"
                              type="number"
                              step="any"
                              disabled={readOnly}
                              value={current.normMdPerUnit ?? ""}
                              onChange={(e) =>
                                patchActivity(current.id, {
                                  normMdPerUnit: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                            />
                            <Input
                              label="Wage rate (ETB)"
                              type="number"
                              step="any"
                              disabled={readOnly}
                              value={current.normWageEtb ?? ""}
                              onChange={(e) =>
                                patchActivity(current.id, {
                                  normWageEtb: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                            />
                            <Input
                              label="wa. / MD"
                              type="number"
                              step="any"
                              disabled={readOnly}
                              value={current.normsPerMd ?? ""}
                              onChange={(e) =>
                                patchActivity(current.id, {
                                  normsPerMd: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                            />
                            <Input
                              label="Net area"
                              type="number"
                              step="any"
                              disabled={readOnly}
                              value={current.netArea ?? ""}
                              onChange={(e) =>
                                patchActivity(current.id, {
                                  netArea: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                            />
                            <Input
                              label="Frequency"
                              type="number"
                              step="any"
                              disabled={readOnly}
                              value={current.frequency ?? ""}
                              onChange={(e) =>
                                patchActivity(current.id, {
                                  frequency: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        ) : null}

                        {showMonths ? (
                          <div className="rounded-lg border p-3">
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                              {BUDGET_MONTHS.map((m) => {
                                const row = (current.schedule || []).find((r) => r.month === m);
                                return (
                                  <label key={m} className="text-xs">
                                    <span className="mb-1 block text-muted-foreground">{MONTH_LABELS[m]}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step="any"
                                      disabled={readOnly}
                                      className="w-full rounded border border-input bg-background px-2 py-1.5 text-right tabular-nums"
                                      value={row?.quantity || ""}
                                      onChange={(e) => {
                                        if (readOnly) return;
                                        const next = setMonthQuantity(current, m, Number(e.target.value) || 0);
                                        replaceActivity(current.id, { ...next, enabled: true });
                                      }}
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="rounded-lg bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
                    Skipped
                  </p>
                )}

                {!readOnly ? (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                    <Button type="button" variant="ghost" disabled={step === 0} onClick={goPrev}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={skipActivity}>
                        <SkipForward className="mr-1 h-4 w-4" />
                        Skip
                      </Button>
                      {step < activities.length - 1 ? (
                        <Button type="button" onClick={includeAndNext}>
                          {current.enabled ? "Next" : "Include & next"}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add another
                        </Button>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
