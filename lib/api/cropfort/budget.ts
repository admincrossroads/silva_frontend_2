import api from "../index";

export interface BudgetEstimateLineItem {
  blockId: string | null;
  blockCode: string;
  blockLabel?: string | null;
  activityId: string;
  activityCode: string;
  activityName: string;
  unitOfMeasure: string;
  qty: number;
  laborCostEtb: number;
  materialCostEtb: number;
  serviceCostEtb: number;
  totalCostEtb: number;
  warnings?: string[];
}

export interface BudgetEstimate {
  lineItems: BudgetEstimateLineItem[];
  totals: {
    laborCostEtb: number;
    materialCostEtb: number;
    serviceCostEtb: number;
    totalCostEtb: number;
  };
  warnings: string[];
}

export interface BudgetEstimateInput {
  operationKind?: "intervention" | "project";
  farmEstateId?: string | null;
  blockIds?: string[];
  activityIds: string[];
}

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
  serviceCostEtb?: number;
  totalCostEtb: number;
}

export interface BudgetPreview {
  rows: BudgetPreviewRow[];
  totals: {
    laborCostEtb: number;
    materialCostEtb: number;
    serviceCostEtb?: number;
    totalCostEtb: number;
  };
}

export const budgetApi = {
  preview: (params?: { planYear?: number; blockId?: string; budgetMonth?: string }) =>
    api.get<{ data: BudgetPreview }>("/cropfort/budget", { params }).then((r) => r.data.data),

  estimate: (body: BudgetEstimateInput) =>
    api.post<{ data: BudgetEstimate }>("/cropfort/budget/estimate", body).then((r) => r.data.data),
};
