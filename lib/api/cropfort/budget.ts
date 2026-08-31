import api from "../index";

export interface BudgetPreviewRow {
  programId: string;
  planYear: number;
  blockId: string;
  blockCode: string;
  blockLabel?: string | null;
  activityId: string;
  activityCode: string;
  activityName: string;
  budgetMonth?: string | null;
  plannedQty: number;
  rateEtb?: number;
  laborCostEtb: number;
  materialCostEtb: number;
  totalCostEtb: number;
}

export interface BudgetPreview {
  rows: BudgetPreviewRow[];
  totals: {
    laborCostEtb: number;
    materialCostEtb: number;
    totalCostEtb: number;
  };
}

export const budgetApi = {
  preview: (params?: { planYear?: number; blockId?: string; budgetMonth?: string }) =>
    api.get<{ data: BudgetPreview }>("/cropfort/budget", { params }).then((r) => r.data.data),
};
