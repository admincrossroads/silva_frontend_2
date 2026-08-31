import { siteConfig } from "@/lib/config/site";

/** Budget year months: Oct → Sep (Ethiopian / farm FY). */
export const BUDGET_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const MONTH_LABELS: Record<number, string> = {
  10: "Oct",
  11: "Nov",
  12: "Dec",
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
};

export const QUARTERS: Array<{ label: string; months: number[] }> = [
  { label: "1st Q", months: [10, 11, 12] },
  { label: "2nd Q", months: [1, 2, 3] },
  { label: "3rd Q", months: [4, 5, 6] },
  { label: "4th Q", months: [7, 8, 9] },
];

export type MonthScheduleRow = {
  month: number;
  quantity?: number;
  mandays?: number;
  costEtb?: number;
};

export type WorkPlanActivityTemplate = {
  id: string;
  nameEn: string;
  nameAm?: string | null;
  unit: string;
  /** Man-days per unit of work (md/unit). */
  normMdPerUnit?: number | null;
  /** Daily wage rate (ETB). */
  normWageEtb?: number | null;
  /** Work amount completed per man-day (wa./MD / Norms/md). */
  normsPerMd?: number | null;
  /** Optional planning inputs → annual qty = netArea × frequency. */
  netArea?: number | null;
  frequency?: number | null;
  /** Cost per unit (usually wage × md/unit). */
  costPerUnit?: number | null;
  annualQuantity?: number | null;
  annualMandays?: number | null;
  annualCostEtb?: number | null;
  schedule?: MonthScheduleRow[];
};

export type WorkPlanSectionScope = {
  blocks?: string[];
  areaHa?: number;
  grossAreaHa?: number;
  trees?: number;
  productiveTrees?: number;
  seedlings?: number;
};

export type WorkPlanActivityDraft = WorkPlanActivityTemplate & {
  enabled: boolean;
  suggestedQuantity?: number;
};

export type WorkPlanSectionDraft = {
  sectionCode: string;
  sectionLabel: string;
  afpLineId: string;
  enabled: boolean;
  scope: WorkPlanSectionScope;
  activities: WorkPlanActivityDraft[];
};

export type WorkPlanTemplate = {
  farmBlocks: string[];
  farmOptions?: Array<{ id: string; name: string; defaultAreaHa?: number }>;
  budgetYears?: Array<{ label: string; gc: number }>;
  categories: Array<{ afpLineId: string; discipline: string; activity: string; kpi: string }>;
  budgetMonths: number[];
  sections: Array<{
    sectionCode: string;
    sectionLabel: string;
    afpLineId: string;
    scope?: WorkPlanSectionScope | null;
    activities: WorkPlanActivityTemplate[];
  }>;
  salarySection?: {
    sectionCode: string;
    sectionLabel: string;
    afpLineId: string;
    activities: WorkPlanActivityTemplate[];
  } | null;
  salaryLines?: WorkPlanActivityTemplate[];
};

export type ParsedWorkPlan = {
  source?: string;
  inputMethod?: "form" | "excel";
  farmEstateId?: string | null;
  farmName?: string | null;
  totalAreaHa?: number | null;
  budgetYearLabel?: string;
  budgetYearGc?: number;
  categories?: Array<{ afpLineId: string; activity: string; budgetEtb: number }>;
  sections?: Array<{
    sectionCode: string;
    sectionLabel: string;
    afpLineId: string;
    scope?: WorkPlanSectionScope | null;
    activities: WorkPlanActivityTemplate[];
  }>;
  grandTotalEtb?: number;
  reconciliation?: { balanced: boolean; categoryTotalEtb: number };
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function emptySchedule(): MonthScheduleRow[] {
  return BUDGET_MONTHS.map((month) => ({ month, quantity: 0, mandays: 0, costEtb: 0 }));
}

export function normalizeSchedule(schedule?: MonthScheduleRow[] | null): MonthScheduleRow[] {
  const byMonth = new Map((schedule || []).map((r) => [r.month, r]));
  return BUDGET_MONTHS.map((month) => {
    const row = byMonth.get(month);
    return {
      month,
      quantity: row?.quantity ?? 0,
      mandays: row?.mandays ?? 0,
      costEtb: row?.costEtb ?? 0,
    };
  });
}

/** Md from qty: prefer md/unit; else qty ÷ norms/md (Excel wa./MD). */
export function computeMandays(
  quantity: number,
  normMdPerUnit?: number | null,
  normsPerMd?: number | null,
) {
  if (!quantity) return 0;
  if (normMdPerUnit != null && normMdPerUnit > 0) return round2(quantity * normMdPerUnit);
  if (normsPerMd != null && normsPerMd > 0) return round2(quantity / normsPerMd);
  return 0;
}

export function computeActivityTotals(
  quantity: number,
  normMdPerUnit?: number | null,
  normWageEtb?: number | null,
  normsPerMd?: number | null,
) {
  const md = computeMandays(quantity, normMdPerUnit, normsPerMd);
  const cost = normWageEtb ? round2(md * normWageEtb) : 0;
  return { annualMandays: md, annualCostEtb: cost };
}

export function derivedCostPerUnit(normMdPerUnit?: number | null, normWageEtb?: number | null) {
  if (normMdPerUnit == null || normWageEtb == null) return null;
  return round2(normMdPerUnit * normWageEtb);
}

export function quantityFromNetArea(netArea?: number | null, frequency?: number | null) {
  if (netArea == null || frequency == null) return null;
  return round2(netArea * frequency);
}

function enrichScheduleRow(
  quantity: number,
  act: Pick<WorkPlanActivityTemplate, "normMdPerUnit" | "normWageEtb" | "normsPerMd">,
): Pick<MonthScheduleRow, "quantity" | "mandays" | "costEtb"> {
  const totals = computeActivityTotals(quantity, act.normMdPerUnit, act.normWageEtb, act.normsPerMd);
  return {
    quantity,
    mandays: totals.annualMandays,
    costEtb: totals.annualCostEtb,
  };
}

/** Recompute annuals from schedule months (if any qty) or from annualQuantity. */
export function recomputeActivity(act: WorkPlanActivityDraft): WorkPlanActivityDraft {
  const hasLaborNorm =
    (act.normMdPerUnit != null && act.normMdPerUnit > 0) ||
    (act.normsPerMd != null && act.normsPerMd > 0);

  // Fixed-cost / payroll lines: keep explicit annualCostEtb when there are no labor norms.
  if (!hasLaborNorm) {
    return {
      ...act,
      schedule: normalizeSchedule(act.schedule),
      annualMandays: act.annualMandays ?? 0,
      annualCostEtb: act.annualCostEtb ?? 0,
      costPerUnit: act.costPerUnit ?? null,
    };
  }

  const schedule = normalizeSchedule(act.schedule).map((row) => ({
    ...row,
    ...enrichScheduleRow(row.quantity || 0, act),
  }));
  const monthQtySum = round2(schedule.reduce((s, r) => s + (r.quantity || 0), 0));
  const hasMonthly = monthQtySum > 0;

  // Preserve Excel-imported annual totals when there is no monthly breakdown to drive recalculation.
  if (
    !hasMonthly &&
    (act.annualCostEtb ?? 0) > 0 &&
    (act.annualMandays ?? 0) > 0 &&
    (act.annualQuantity ?? 0) > 0
  ) {
    const costPerUnit =
      act.costPerUnit ??
      (act.annualQuantity ? round2(act.annualCostEtb! / act.annualQuantity) : null) ??
      derivedCostPerUnit(act.normMdPerUnit, act.normWageEtb);
    return {
      ...act,
      costPerUnit,
      schedule,
      annualQuantity: act.annualQuantity ?? 0,
      annualMandays: act.annualMandays ?? 0,
      annualCostEtb: act.annualCostEtb ?? 0,
    };
  }

  const annualQuantity = hasMonthly ? monthQtySum : act.annualQuantity ?? 0;
  const totals = computeActivityTotals(
    annualQuantity,
    act.normMdPerUnit,
    act.normWageEtb,
    act.normsPerMd,
  );
  const costPerUnit =
    act.costPerUnit ?? derivedCostPerUnit(act.normMdPerUnit, act.normWageEtb) ?? null;

  return {
    ...act,
    costPerUnit,
    schedule,
    annualQuantity,
    annualMandays: totals.annualMandays,
    annualCostEtb: totals.annualCostEtb,
  };
}

export function applyNetAreaFrequency(act: WorkPlanActivityDraft): WorkPlanActivityDraft {
  const qty = quantityFromNetArea(act.netArea, act.frequency);
  if (qty == null) return recomputeActivity(act);
  // Clearing monthly distribution when norms drive annual qty keeps Excel-style annual first.
  const cleared = emptySchedule();
  return recomputeActivity({ ...act, annualQuantity: qty, schedule: cleared });
}

export function setMonthQuantity(
  act: WorkPlanActivityDraft,
  month: number,
  quantity: number,
): WorkPlanActivityDraft {
  const schedule = normalizeSchedule(act.schedule).map((row) =>
    row.month === month ? { ...row, quantity } : row,
  );
  return recomputeActivity({ ...act, schedule });
}

export function setAnnualQuantity(act: WorkPlanActivityDraft, quantity: number): WorkPlanActivityDraft {
  // Setting annual directly clears month split (user can re-enter months).
  return recomputeActivity({ ...act, annualQuantity: quantity, schedule: emptySchedule() });
}

export function sectionFromTemplate(
  templateSection: WorkPlanTemplate["sections"][0],
  saved?: ParsedWorkPlan["sections"] extends (infer S)[] | undefined ? S : never,
): WorkPlanSectionDraft {
  const savedSection = saved;
  const isBlank = !savedSection;

  // Excel / saved plan: use imported activities directly — don't merge with template defaults.
  if (savedSection && savedSection.activities.length > 0) {
    return {
      sectionCode: templateSection.sectionCode,
      sectionLabel: savedSection.sectionLabel || templateSection.sectionLabel,
      afpLineId: templateSection.afpLineId,
      enabled: true,
      scope: {
        blocks: savedSection.scope?.blocks ?? templateSection.scope?.blocks ?? [],
        areaHa: savedSection.scope?.areaHa ?? templateSection.scope?.areaHa,
        grossAreaHa: savedSection.scope?.grossAreaHa ?? templateSection.scope?.grossAreaHa,
        trees: savedSection.scope?.trees ?? templateSection.scope?.trees,
        productiveTrees:
          savedSection.scope?.productiveTrees ?? templateSection.scope?.productiveTrees,
        seedlings: savedSection.scope?.seedlings ?? templateSection.scope?.seedlings,
      },
      activities: savedSection.activities.map((savedAct) => {
        const draft: WorkPlanActivityDraft = {
          id: savedAct.id,
          nameEn: savedAct.nameEn,
          nameAm: savedAct.nameAm ?? null,
          unit: savedAct.unit ?? "unit",
          normMdPerUnit: savedAct.normMdPerUnit ?? null,
          normWageEtb: savedAct.normWageEtb ?? null,
          normsPerMd: savedAct.normsPerMd ?? null,
          netArea: savedAct.netArea ?? null,
          frequency: savedAct.frequency ?? null,
          costPerUnit: savedAct.costPerUnit ?? null,
          annualQuantity: savedAct.annualQuantity ?? 0,
          annualMandays: savedAct.annualMandays ?? 0,
          annualCostEtb: savedAct.annualCostEtb ?? 0,
          schedule: savedAct.schedule ?? emptySchedule(),
          enabled: true,
          suggestedQuantity: savedAct.annualQuantity ?? 0,
        };
        return recomputeActivity(draft);
      }),
    };
  }

  const savedActs = new Map((savedSection?.activities || []).map((a) => [a.id, a]));

  return {
    sectionCode: templateSection.sectionCode,
    sectionLabel: templateSection.sectionLabel,
    afpLineId: templateSection.afpLineId,
    enabled: savedSection ? savedSection.activities.length > 0 : false,
    scope: {
      blocks: savedSection?.scope?.blocks ?? (isBlank ? [] : templateSection.scope?.blocks ?? []),
      areaHa: savedSection?.scope?.areaHa ?? (isBlank ? undefined : templateSection.scope?.areaHa),
      grossAreaHa: savedSection?.scope?.grossAreaHa ?? (isBlank ? undefined : templateSection.scope?.grossAreaHa),
      trees: savedSection?.scope?.trees ?? (isBlank ? undefined : templateSection.scope?.trees),
      productiveTrees:
        savedSection?.scope?.productiveTrees ?? (isBlank ? undefined : templateSection.scope?.productiveTrees),
      seedlings: savedSection?.scope?.seedlings ?? (isBlank ? undefined : templateSection.scope?.seedlings),
    },
    activities: templateSection.activities.map((act) => {
      const savedAct = savedActs.get(act.id);
      const enabled = savedSection ? Boolean(savedAct) : false;
      const base: WorkPlanActivityDraft = {
        ...act,
        ...savedAct,
        id: act.id,
        nameEn: act.nameEn,
        nameAm: savedAct?.nameAm ?? act.nameAm,
        unit: savedAct?.unit ?? act.unit,
        normMdPerUnit: savedAct?.normMdPerUnit ?? act.normMdPerUnit,
        normWageEtb: savedAct?.normWageEtb ?? act.normWageEtb,
        normsPerMd: savedAct?.normsPerMd ?? act.normsPerMd,
        netArea: savedAct?.netArea ?? act.netArea,
        frequency: savedAct?.frequency ?? act.frequency,
        costPerUnit: savedAct?.costPerUnit ?? act.costPerUnit,
        suggestedQuantity: act.annualQuantity ?? 0,
        enabled,
        annualQuantity: savedAct?.annualQuantity ?? (enabled ? act.annualQuantity ?? 0 : 0),
        schedule: savedAct?.schedule ?? act.schedule ?? emptySchedule(),
      };
      if (!enabled) {
        return {
          ...base,
          annualQuantity: 0,
          annualMandays: 0,
          annualCostEtb: 0,
          schedule: emptySchedule(),
        };
      }
      return recomputeActivity(base);
    }),
  };
}

export function initSectionsFromTemplate(
  template: WorkPlanTemplate,
  parsed?: ParsedWorkPlan | null,
): WorkPlanSectionDraft[] {
  const savedByCode = new Map((parsed?.sections || []).map((s) => [s.sectionCode, s]));
  const sections = template.sections.map((s) => sectionFromTemplate(s, savedByCode.get(s.sectionCode)));

  if (template.salarySection) {
    const saved = savedByCode.get("salary");
    sections.push(sectionFromTemplate(template.salarySection, saved));
  }

  return sections;
}

export function buildParsedFromSections(
  sections: WorkPlanSectionDraft[],
  inputMethod: "form" | "excel" = "form",
): ParsedWorkPlan {
  const activeSections = sections
    .filter((s) => s.enabled)
    .map((s) => ({
      sectionCode: s.sectionCode,
      sectionLabel: s.sectionLabel,
      afpLineId: s.afpLineId,
      scope: s.scope,
      activities: s.activities
        .filter((a) => a.enabled)
        .map(({ enabled: _e, suggestedQuantity: _s, ...act }) => {
          const recomputed = recomputeActivity({ ...act, enabled: true });
          const { enabled: _en, suggestedQuantity: _sg, ...rest } = recomputed;
          return rest;
        }),
    }))
    .filter((s) => s.activities.length > 0);

  const grandTotalEtb = round2(
    activeSections.reduce(
      (sum, sec) => sum + sec.activities.reduce((a, act) => a + (act.annualCostEtb || 0), 0),
      0,
    ),
  );

  return {
    source: inputMethod === "form" ? `${siteConfig.name} form builder` : "Excel upload",
    inputMethod,
    sections: activeSections,
    categories: [],
    grandTotalEtb,
  };
}

export function sectionTotals(section: WorkPlanSectionDraft) {
  const active = section.activities.filter((a) => a.enabled).map(recomputeActivity);
  return {
    activityCount: active.length,
    mandays: round2(active.reduce((s, a) => s + (a.annualMandays || 0), 0)),
    costEtb: round2(active.reduce((s, a) => s + (a.annualCostEtb || 0), 0)),
  };
}

const SECTION_ID_PREFIX: Record<string, string> = {
  nursery: "NUR",
  young_coffee: "YNG",
  matured_coffee: "MAT",
  infilling: "INF",
  harvest: "HAR",
  materials: "MATL",
  salary: "PAY",
};

/** Create a user-defined activity for a section. */
export function createCustomActivity(
  sectionCode: string,
  existing: WorkPlanActivityDraft[],
  input: {
    nameEn: string;
    nameAm?: string;
    unit: string;
    annualQuantity?: number;
    normMdPerUnit?: number | null;
    normWageEtb?: number | null;
    normsPerMd?: number | null;
  },
): WorkPlanActivityDraft {
  const prefix = SECTION_ID_PREFIX[sectionCode] || "ACT";
  const used = new Set(existing.map((a) => a.id));
  let n = existing.length + 1;
  let id = `${prefix}-${String(n).padStart(2, "0")}`;
  while (used.has(id)) {
    n += 1;
    id = `${prefix}-${String(n).padStart(2, "0")}`;
  }
  const draft: WorkPlanActivityDraft = {
    id,
    nameEn: input.nameEn.trim(),
    nameAm: input.nameAm?.trim() || null,
    unit: input.unit.trim() || "unit",
    normMdPerUnit: input.normMdPerUnit ?? 1,
    normWageEtb: input.normWageEtb ?? 50,
    normsPerMd: input.normsPerMd ?? null,
    annualQuantity: input.annualQuantity ?? 0,
    annualMandays: 0,
    annualCostEtb: 0,
    schedule: emptySchedule(),
    enabled: true,
    suggestedQuantity: input.annualQuantity ?? 0,
  };
  return recomputeActivity(draft);
}

export function sectionMonthlyTotals(section: WorkPlanSectionDraft) {
  const months = BUDGET_MONTHS.map((month) => ({ month, mandays: 0, costEtb: 0, quantity: 0 }));
  for (const act of section.activities.filter((a) => a.enabled)) {
    const recomputed = recomputeActivity(act);
    for (const row of normalizeSchedule(recomputed.schedule)) {
      const slot = months.find((m) => m.month === row.month)!;
      slot.quantity = round2(slot.quantity + (row.quantity || 0));
      slot.mandays = round2(slot.mandays + (row.mandays || 0));
      slot.costEtb = round2(slot.costEtb + (row.costEtb || 0));
    }
  }
  return months;
}

export const SCOPE_FIELDS: Record<
  string,
  Array<{ key: keyof WorkPlanSectionScope; label: string; step?: string }>
> = {
  nursery: [
    { key: "areaHa", label: "Plantation area (ha)", step: "0.01" },
    { key: "seedlings", label: "Total seedlings (No)" },
  ],
  young_coffee: [
    { key: "grossAreaHa", label: "Gross plantation area (ha)", step: "0.01" },
    { key: "trees", label: "Total productive trees (No)" },
  ],
  matured_coffee: [
    { key: "areaHa", label: "Total coffee area (ha)", step: "0.01" },
    { key: "productiveTrees", label: "Productive trees (No)" },
  ],
  infilling: [
    { key: "areaHa", label: "Infilling area (ha)", step: "0.01" },
    { key: "trees", label: "Seedlings to plant (No)" },
  ],
  harvest: [
    { key: "grossAreaHa", label: "Gross plantation area (ha)", step: "0.01" },
    { key: "productiveTrees", label: "Productive tree average (No)" },
  ],
  salary: [],
};
