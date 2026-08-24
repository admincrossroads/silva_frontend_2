"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import type { WorkPlanTemplate } from "@/lib/work-plan/builder";
import type { FarmEstate } from "@/lib/api/farm-estates";

export type WorkPlanSetupValues = {
  farmEstateId: string;
  totalAreaHa: string;
  budgetYearLabel: string;
  budgetYearGc: number;
  fxEtbPerUsd: string;
};

export const DEFAULT_BUDGET_YEARS = [
  { label: "2017/18 EC (2024/25 GC)", gc: 2025 },
  { label: "2018/19 EC (2025/26 GC)", gc: 2026 },
  { label: "2019/20 EC (2026/27 GC)", gc: 2027 },
  { label: "2020/21 EC (2027/28 GC)", gc: 2028 },
];

type Props = {
  estates?: FarmEstate[];
  estatesLoading?: boolean;
  template?: Pick<WorkPlanTemplate, "budgetYears"> | null;
  initial?: {
    farmEstateId?: string | null;
    farmName?: string | null;
    totalAreaHa?: number | null;
    budgetYearLabel?: string;
    budgetYearGc?: number;
    fxEtbPerUsd?: number | string;
  };
  readOnly?: boolean;
  submitLabel?: string;
  isPending?: boolean;
  onSubmit: (values: WorkPlanSetupValues) => void;
};

export function WorkPlanSetupForm({
  estates = [],
  estatesLoading,
  template,
  initial,
  readOnly,
  submitLabel = "Save plan details",
  isPending,
  onSubmit,
}: Props) {
  const budgetYears = template?.budgetYears?.length ? template.budgetYears : DEFAULT_BUDGET_YEARS;
  const defaultYear = budgetYears.find((y) => y.gc === 2026) ?? budgetYears[0];

  const [farmEstateId, setFarmEstateId] = useState(initial?.farmEstateId || "");
  const [totalAreaHa, setTotalAreaHa] = useState(
    initial?.totalAreaHa != null ? String(initial.totalAreaHa) : "",
  );
  const [budgetYearLabel, setBudgetYearLabel] = useState(
    initial?.budgetYearLabel || defaultYear.label,
  );
  const [budgetYearGc, setBudgetYearGc] = useState(initial?.budgetYearGc ?? defaultYear.gc);
  const [fxEtbPerUsd, setFxEtbPerUsd] = useState(initial?.fxEtbPerUsd?.toString() || "130");

  useEffect(() => {
    if (initial?.farmEstateId) setFarmEstateId(initial.farmEstateId);
    if (initial?.totalAreaHa != null) setTotalAreaHa(String(initial.totalAreaHa));
    if (initial?.budgetYearLabel) setBudgetYearLabel(initial.budgetYearLabel);
    if (initial?.budgetYearGc) setBudgetYearGc(initial.budgetYearGc);
    if (initial?.fxEtbPerUsd) setFxEtbPerUsd(String(initial.fxEtbPerUsd));
  }, [
    initial?.farmEstateId,
    initial?.totalAreaHa,
    initial?.budgetYearLabel,
    initial?.budgetYearGc,
    initial?.fxEtbPerUsd,
  ]);

  const handleEstatePick = (value: string) => {
    setFarmEstateId(value);
    const estate = estates.find((e) => e.id === value);
    if (estate?.totalAreaHa != null && !totalAreaHa) {
      setTotalAreaHa(String(estate.totalAreaHa));
    }
  };

  const handleBudgetYear = (label: string) => {
    setBudgetYearLabel(label);
    const match = budgetYears.find((y) => y.label === label);
    if (match) setBudgetYearGc(match.gc);
  };

  const selectedEstate = estates.find((e) => e.id === farmEstateId);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!farmEstateId) return;
        onSubmit({
          farmEstateId,
          totalAreaHa,
          budgetYearLabel,
          budgetYearGc,
          fxEtbPerUsd,
        });
      }}
    >
      {estatesLoading ? (
        <p className="text-sm text-muted-foreground">Loading farm estates…</p>
      ) : estates.length === 0 && !readOnly ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No farm estates are assigned to your vendor. Ask SPX to create an estate and map your organization.
        </p>
      ) : readOnly && farmEstateId && !selectedEstate ? (
        <Input
          id="farmEstateReadonly"
          label="Farm / estate"
          value={initial?.farmName || farmEstateId}
          disabled
          readOnly
        />
      ) : (
        <Select
          id="farmEstateId"
          label="Farm / estate"
          value={farmEstateId}
          disabled={readOnly}
          onChange={(e) => handleEstatePick(e.target.value)}
        >
          <option value="">Select farm…</option>
          {estates.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.location ? ` · ${e.location}` : ""}
            </option>
          ))}
        </Select>
      )}

      {selectedEstate && !readOnly ? (
        <p className="text-xs text-muted-foreground">
          {selectedEstate.blocks.length} blocks configured
          {selectedEstate.vendors.length
            ? ` · ${selectedEstate.vendors.map((v) => v.name).join(", ")}`
            : null}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="totalAreaHa"
          label="Total farm area (ha)"
          type="number"
          step="0.01"
          min="0"
          disabled={readOnly}
          value={totalAreaHa}
          onChange={(e) => setTotalAreaHa(e.target.value)}
          placeholder="128.94"
        />
        <Input
          id="fxEtbPerUsd"
          label="FX rate (ETB / USD)"
          type="number"
          step="0.01"
          min="1"
          disabled={readOnly}
          value={fxEtbPerUsd}
          onChange={(e) => setFxEtbPerUsd(e.target.value)}
        />
      </div>

      <Select
        id="budgetYear"
        label="Budget year"
        value={budgetYearLabel}
        disabled={readOnly}
        onChange={(e) => handleBudgetYear(e.target.value)}
      >
        {budgetYears.map((y) => (
          <option key={y.gc} value={y.label}>
            {y.label}
          </option>
        ))}
      </Select>

      {!readOnly ? (
        <Button type="submit" disabled={isPending || !farmEstateId || estates.length === 0}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      ) : null}
    </form>
  );
}
