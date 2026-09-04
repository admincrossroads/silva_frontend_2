import type { FeeSchedule } from "./field-work-calendar";

export type BudgetRollupBlock = {
  blockId: string | null;
  blockCode?: string | null;
  labor: number;
  material: number;
  service: number;
  total: number;
  electedActivities: number;
  tier: string;
};

export type BudgetRollupFarmWide = {
  labor: number;
  material: number;
  service: number;
  total: number;
  electedActivities: number;
  tier?: string;
  tier2Activities?: number;
  tier3Activities?: number;
};

export type FarmBudgetRollup = {
  farmEstateId: string;
  planYear: number;
  tier1ByBlock: BudgetRollupBlock[];
  tier23FarmWide: BudgetRollupFarmWide | null;
  totals: {
    labor: number;
    material: number;
    service: number;
  };
};

export type { FeeSchedule };
