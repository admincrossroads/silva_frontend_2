import api from "../index";

export type WorkflowStageStatus = "locked" | "active" | "complete";

export type WorkflowStage = {
  key: string;
  label: string;
  order: number;
  status: WorkflowStageStatus;
  completedAt: string | null;
  gatePassed: boolean;
  gateReasons: string[];
  prerequisites: string[];
};

export type FarmWorkflowJourney = {
  farmEstateId: string;
  activeStageKey: string;
  stages: WorkflowStage[];
};

export type BenchmarkSurvey = {
  id: string;
  activityId: string;
  activityCode?: string;
  activityName?: string;
  neighbor1Name?: string | null;
  neighbor2Name?: string | null;
  neighbor1Rate?: number | null;
  neighbor2Rate?: number | null;
  lockedAt?: string | null;
  recommendedRate?: number | null;
  proposedRate?: number | null;
  status: string;
  useNormWage: boolean;
};

export type BenchmarkImportResult = {
  imported: number;
  normWage: number;
  refreshed?: number;
  unchanged?: number;
  tier1Total: number;
};

export type WorkbookImportResult = {
  farmEstateId: string;
  planYear: number;
  completedStages?: string[];
  stages: {
    farm_block_setup?: {
      termStartDate: string | null;
      blocksCreated: number;
      blocksUpdated: number;
      unmatchedExistingBlocks: string[];
    };
    benchmark_survey?: BenchmarkImportResult;
    rate_cards_confirmed?: {
      laborCards: number;
      laborCardsRefreshed: number;
      materialServiceLines: number;
      materialServiceRefreshed: number;
      nonWorkbookLaborCards: string[];
      nonWorkbookRateLines: string[];
    };
    fee_schedule_set?: {
      skipped?: boolean;
      confirmedAnnualFee: number;
      electiveLines?: number;
    };
    tier_election?: {
      coreBundleElected: boolean | null;
      elections: number;
      electedTier23: number;
      activityPlans: number;
      skippedUnknown: number;
    };
  };
};

export type CropfortElection = {
  id: string;
  activityCode?: string;
  activityName?: string;
  tier?: string;
  elected: boolean;
  electionOverride?: boolean | null;
  commercialAgreementRef?: string | null;
};

export type ActivityPlan = {
  id: string;
  activityCode?: string;
  blockCode?: string;
  elected: boolean;
  plannedQty?: number | null;
  totalPlannedCost?: number | null;
};

export const farmPlatformApi = {
  getWorkflow: (farmId: string) =>
    api.get<{ data: FarmWorkflowJourney }>(`/cropfort/farms/${farmId}/workflow`).then((r) => r.data.data),

  completeStage: (farmId: string, stageKey: string) =>
    api
      .post<{ data: unknown }>(`/cropfort/farms/${farmId}/workflow/${stageKey}/complete`, {})
      .then((r) => r.data.data),

  listBenchmarkSurveys: (farmId: string) =>
    api
      .get<{ data: BenchmarkSurvey[] }>(`/cropfort/farms/${farmId}/benchmark-surveys`)
      .then((r) => r.data.data),

  importFarmWorkbook: (farmId: string, planYear = 2026) =>
    api
      .post<{ data: WorkbookImportResult }>(`/cropfort/farms/${farmId}/import-workbook`, {
        planYear,
      })
      .then((r) => r.data.data),

  importBenchmarkSurveys: (farmId: string) =>
    api
      .post<{ data: BenchmarkImportResult }>(
        `/cropfort/farms/${farmId}/benchmark-surveys/import`,
        {},
      )
      .then((r) => r.data.data),

  lockBenchmarkSurvey: (surveyId: string) =>
    api
      .post<{ data: BenchmarkSurvey }>(`/cropfort/benchmark-surveys/${surveyId}/lock`, {})
      .then((r) => r.data.data),

  submitBenchmarkSurvey: (surveyId: string) =>
    api
      .post<{ data: BenchmarkSurvey }>(`/cropfort/benchmark-surveys/${surveyId}/submit`, {})
      .then((r) => r.data.data),

  approveBenchmarkSurvey: (surveyId: string) =>
    api
      .post<{ data: BenchmarkSurvey }>(`/cropfort/benchmark-surveys/${surveyId}/approve`, {})
      .then((r) => r.data.data),

  markUseNormWage: (farmId: string, activityId: string) =>
    api
      .post<{ data: BenchmarkSurvey }>(`/cropfort/farms/${farmId}/benchmark-surveys/use-norm-wage`, {
        activityId,
      })
      .then((r) => r.data.data),

  setCoreBundle: (farmId: string, elected: boolean) =>
    api
      .post<{ data: unknown }>(`/cropfort/farms/${farmId}/elections/core-bundle`, { elected })
      .then((r) => r.data.data),

  listElections: (farmId: string, params?: { tier?: string; planYear?: number }) =>
    api
      .get<{ data: CropfortElection[] }>(`/cropfort/farms/${farmId}/elections`, { params })
      .then((r) => r.data.data),

  upsertElection: (farmId: string, body: Record<string, unknown>) =>
    api.put<{ data: CropfortElection }>(`/cropfort/farms/${farmId}/elections`, body).then((r) => r.data.data),

  listActivityPlans: (farmId: string, planYear?: number) =>
    api
      .get<{ data: ActivityPlan[] }>(`/cropfort/farms/${farmId}/activity-plans`, {
        params: planYear ? { planYear } : undefined,
      })
      .then((r) => r.data.data),

  upsertActivityPlan: (farmId: string, body: Record<string, unknown>) =>
    api
      .put<{ data: ActivityPlan }>(`/cropfort/farms/${farmId}/activity-plans`, body)
      .then((r) => r.data.data),

  getFeeSchedule: (farmId: string) =>
    api.get<{ data: unknown }>(`/cropfort/farms/${farmId}/fee-schedule`).then((r) => r.data.data),

  upsertFeeSchedule: (farmId: string, body: Record<string, unknown>) =>
    api.put<{ data: unknown }>(`/cropfort/farms/${farmId}/fee-schedule`, body).then((r) => r.data.data),

  getCashFlow: (farmId: string, from: string, to: string) =>
    api
      .get<{ data: unknown[] }>(`/cropfort/farms/${farmId}/cash-flow`, { params: { from, to } })
      .then((r) => r.data.data),

  getBudgetRollup: (farmId: string, planYear: number) =>
    api
      .get<{ data: import("./farm-budget").FarmBudgetRollup }>(
        `/cropfort/farms/${farmId}/budget-rollup`,
        { params: { planYear } },
      )
      .then((r) => r.data.data),

  getMonthlyReport: (farmId: string, reportMonth: string) =>
    api
      .get<{ data: unknown }>(`/cropfort/farms/${farmId}/monthly-report`, { params: { reportMonth } })
      .then((r) => r.data.data),
};
