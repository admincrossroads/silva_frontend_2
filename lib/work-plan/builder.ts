export type WorkPlanActivityTemplate = {
  id: string;
  nameEn: string;
  nameAm?: string | null;
  unit: string;
  normMdPerUnit?: number | null;
  normWageEtb?: number | null;
  normsPerMd?: number | null;
  annualQuantity?: number | null;
  annualMandays?: number | null;
  annualCostEtb?: number | null;
  schedule?: Array<{ month: number; quantity?: number; mandays?: number; costEtb?: number }>;
};

export type WorkPlanSectionScope = {
  blocks?: string[];
  areaHa?: number;
  grossAreaHa?: number;
  trees?: number;
  productiveTrees?: number;
  seedlings?: number;
};

export type WorkPlanSectionDraft = {
  sectionCode: string;
  sectionLabel: string;
  afpLineId: string;
  enabled: boolean;
  scope: WorkPlanSectionScope;
  activities: Array<WorkPlanActivityTemplate & { enabled: boolean; suggestedQuantity?: number }>;
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
  fxEtbPerUsd?: number;
  categories?: Array<{ afpLineId: string; activity: string; budgetEtb: number; budgetUsd?: number }>;
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

export function computeActivityTotals(
  quantity: number,
  normMdPerUnit?: number | null,
  normWageEtb?: number | null,
) {
  const md = normMdPerUnit ? round2(quantity * normMdPerUnit) : 0;
  const cost = normWageEtb ? round2(md * normWageEtb) : 0;
  return { annualMandays: md, annualCostEtb: cost };
}

export function sectionFromTemplate(
  templateSection: WorkPlanTemplate["sections"][0],
  saved?: ParsedWorkPlan["sections"] extends (infer S)[] | undefined ? S : never,
): WorkPlanSectionDraft {
  const savedSection = saved;
  const savedActs = new Map((savedSection?.activities || []).map((a) => [a.id, a]));
  const isBlank = !savedSection;

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
      const quantity = savedAct?.annualQuantity ?? (enabled ? act.annualQuantity ?? 0 : 0);
      const totals = computeActivityTotals(quantity, act.normMdPerUnit, act.normWageEtb);
      return {
        ...act,
        suggestedQuantity: act.annualQuantity ?? 0,
        enabled,
        annualQuantity: quantity,
        annualMandays: savedAct?.annualMandays ?? (enabled ? totals.annualMandays : 0),
        annualCostEtb: savedAct?.annualCostEtb ?? (enabled ? act.annualCostEtb ?? totals.annualCostEtb : 0),
      };
    }),
  };
}

export function initSectionsFromTemplate(template: WorkPlanTemplate, parsed?: ParsedWorkPlan | null): WorkPlanSectionDraft[] {
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
  fx: number,
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
        .map(({ enabled: _e, ...act }) => act),
    }))
    .filter((s) => s.activities.length > 0);

  const grandTotalEtb = round2(
    activeSections.reduce(
      (sum, sec) => sum + sec.activities.reduce((a, act) => a + (act.annualCostEtb || 0), 0),
      0,
    ),
  );

  return {
    source: inputMethod === "form" ? "Coffee Field OS form builder" : "Excel upload",
    inputMethod,
    fxEtbPerUsd: fx,
    sections: activeSections,
    categories: [],
    grandTotalEtb,
  };
}

export function sectionTotals(section: WorkPlanSectionDraft) {
  const active = section.activities.filter((a) => a.enabled);
  return {
    activityCount: active.length,
    mandays: round2(active.reduce((s, a) => s + (a.annualMandays || 0), 0)),
    costEtb: round2(active.reduce((s, a) => s + (a.annualCostEtb || 0), 0)),
  };
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
