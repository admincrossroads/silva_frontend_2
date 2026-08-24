"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  computeActivityTotals,
  sectionTotals,
  SCOPE_FIELDS,
  type WorkPlanSectionDraft,
} from "@/lib/work-plan/builder";

type Props = {
  section: WorkPlanSectionDraft;
  farmBlocks: string[];
  onChange: (section: WorkPlanSectionDraft) => void;
  readOnly?: boolean;
};

export function WorkPlanSectionEditor({ section, farmBlocks, onChange, readOnly }: Props) {
  const totals = sectionTotals(section);
  const scopeFields = SCOPE_FIELDS[section.sectionCode] || [];

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

  const toggleSection = (enabled: boolean) => {
    if (readOnly) return;
    onChange({ ...section, enabled });
  };

  const updateActivity = (id: string, patch: Partial<WorkPlanSectionDraft["activities"][0]>) => {
    if (readOnly) return;
    onChange({
      ...section,
      activities: section.activities.map((a) => {
        if (a.id !== id) return a;
        const enabling = patch.enabled === true && !a.enabled;
        const merged = {
          ...a,
          ...patch,
          ...(enabling && !patch.annualQuantity && !a.annualQuantity
            ? { annualQuantity: a.suggestedQuantity ?? 0 }
            : {}),
        };
        if (patch.annualQuantity !== undefined || enabling) {
          const qty = merged.annualQuantity ?? 0;
          const totals = computeActivityTotals(qty, merged.normMdPerUnit, merged.normWageEtb);
          merged.annualMandays = totals.annualMandays;
          merged.annualCostEtb = totals.annualCostEtb;
        }
        return merged;
      }),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{section.sectionLabel}</h3>
          <p className="text-xs text-muted-foreground">{section.afpLineId}</p>
        </div>
        {!readOnly ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={(e) => toggleSection(e.target.checked)}
              className="rounded border-input"
            />
            Include this section
          </label>
        ) : null}
      </div>

      {section.sectionCode !== "salary" ? (
        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Farm blocks</p>
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

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
              {!readOnly ? <th className="px-3 py-2 w-10" /> : null}
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">Activity</th>
              <th className="px-3 py-2 font-medium">Unit</th>
              <th className="px-3 py-2 font-medium text-right">Annual qty</th>
              <th className="px-3 py-2 font-medium text-right">MD</th>
              <th className="px-3 py-2 font-medium text-right">Cost (ETB)</th>
            </tr>
          </thead>
          <tbody>
            {section.activities.map((act) => (
              <tr
                key={act.id}
                className={cn(
                  "border-b last:border-0",
                  !act.enabled && "opacity-40",
                  !section.enabled && "opacity-40",
                )}
              >
                {!readOnly ? (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={act.enabled}
                      disabled={!section.enabled}
                      onChange={(e) => updateActivity(act.id, { enabled: e.target.checked })}
                      className="rounded border-input"
                    />
                  </td>
                ) : null}
                <td className="px-3 py-2 font-mono text-xs">{act.id}</td>
                <td className="px-3 py-2">
                  <div>{act.nameEn}</div>
                  {act.nameAm ? <div className="text-xs text-muted-foreground">{act.nameAm}</div> : null}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{act.unit}</td>
                <td className="px-3 py-2 text-right">
                  {readOnly || !section.enabled || !act.enabled ? (
                    <span className="tabular-nums">{act.annualQuantity?.toLocaleString() ?? "—"}</span>
                  ) : (
                    <input
                      type="number"
                      className="w-24 rounded border border-input bg-background px-2 py-1 text-right tabular-nums"
                      value={act.annualQuantity ?? 0}
                      min={0}
                      step="any"
                      onChange={(e) => updateActivity(act.id, { annualQuantity: Number(e.target.value) || 0 })}
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{act.annualMandays?.toLocaleString() ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">
                  {act.annualCostEtb?.toLocaleString() ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/20 font-medium">
              <td colSpan={readOnly ? 4 : 5} className="px-3 py-2 text-right text-muted-foreground">
                Section total
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.mandays.toLocaleString()} MD</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.costEtb.toLocaleString()} ETB</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
