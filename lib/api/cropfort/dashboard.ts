import api from "../index";

export interface CropfortBvaRow {
  blockId: string;
  blockCode: string;
  blockLabel?: string | null;
  activityId: string;
  activityCode: string;
  activityName: string;
  budgetEtb: number;
  actualEtb: number;
  varianceEtb: number;
  variancePct: number;
  releasedTickets: number;
}

export interface CropfortDashboard {
  currency: string;
  planYear: number;
  bva: {
    rows: CropfortBvaRow[];
    totals: {
      budgetEtb: number;
      actualEtb: number;
      varianceEtb: number;
      variancePct: number;
    };
  };
  opexReserve: {
    monthlyBurnEtb: number;
    reserveMonths: number;
    reserveRequiredEtb: number;
    reserveBalanceEtb: number | null;
    status: "adequate" | "warning" | "critical" | "unknown";
    enforcement: "informational" | "blocking";
  };
  weeklyRollup: {
    id: string;
    weekEnding: string;
    status: string;
    ticketCount: number;
    totalEtb: number;
    submittedAt?: string | null;
    releasedAt?: string | null;
  }[];
  partialWeeklyRelease: boolean;
}

export const cropfortDashboardApi = {
  get: (params?: { planYear?: number; blockId?: string }) =>
    api.get<{ data: CropfortDashboard }>("/cropfort/dashboard", { params }).then((r) => r.data.data),
};
