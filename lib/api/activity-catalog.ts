import api from "./index";

export type ActivityCatalogEntry = {
  id: string;
  programId: string;
  afpLineId: string;
  sectionCode: string;
  sectionLabel: string;
  sortOrder: number;
  nameEn: string;
  nameAm: string | null;
  unit: string;
  normMdPerUnit: number | null;
  normCostEtb: number | null;
  normWageEtb: number | null;
  normsPerMd: number | null;
  annualQuantity: number | null;
  annualMandays: number | null;
  annualCostEtb: number | null;
  scope: Record<string, unknown> | null;
  schedules?: Array<{
    year: number;
    month: number;
    plannedQuantity: number | null;
    plannedMandays: number | null;
    plannedCostEtb: number | null;
  }>;
};

export type ActivityCatalogSummary = {
  afpLineId: string;
  activityCount: number;
  totalMandays: number;
  totalCostEtb: number;
  activities: ActivityCatalogEntry[];
};

export const activityCatalogApi = {
  list: (params?: { afpLineId?: string; sectionCode?: string }) =>
    api.get<{ data: ActivityCatalogEntry[] }>("/activity-catalog", { params }).then((r) => r.data.data),

  summaryByAfp: (afpLineId: string) =>
    api
      .get<{ data: ActivityCatalogSummary }>(`/activity-catalog/by-afp/${afpLineId}/summary`)
      .then((r) => r.data.data),
};
