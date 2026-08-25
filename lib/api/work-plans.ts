import api from "./index";
import type { WorkPlanTemplate } from "@/lib/work-plan/builder";
import type { FarmEstateBlock } from "./farm-estates";

export type WorkPlanStatus = "draft" | "submitted" | "revision_requested" | "accepted" | "rejected";

export type WorkPlanFarmEstate = {
  id: string;
  name: string;
  totalAreaHa: number | null;
  location: string | null;
  status: "active" | "inactive";
  blocks: FarmEstateBlock[];
};

export type WorkPlanSubmission = {
  id: string;
  programId: string;
  vendorId: string;
  farmEstateId: string | null;
  farmName: string | null;
  totalAreaHa: number | null;
  budgetYearLabel: string;
  budgetYearGc: number;
  status: WorkPlanStatus;
  fxEtbPerUsd: number;
  parsedJson: Record<string, unknown> | null;
  sourceAttachmentId: string | null;
  submittedAt: string | null;
  submittedByUserId: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  reviewNotes: string | null;
  promotedAt: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: { id: string; name: string };
  farmEstate?: WorkPlanFarmEstate;
};

type Paginated<T> = { items: T[]; meta: { page: number; pageSize: number; total: number } };

export const workPlansApi = {
  list: (params?: { status?: string; budgetYearGc?: number }) =>
    api
      .get<{ data: Paginated<WorkPlanSubmission> }>("/work-plans", { params })
      .then((r) => r.data.data.items),

  findOne: (id: string) => api.get<{ data: WorkPlanSubmission }>(`/work-plans/${id}`).then((r) => r.data.data),

  template: () => api.get<{ data: WorkPlanTemplate }>("/work-plans/template").then((r) => r.data.data),

  create: (dto: {
    farmEstateId: string;
    totalAreaHa?: number;
    budgetYearLabel: string;
    budgetYearGc: number;
    fxEtbPerUsd?: number;
    parsedJson?: Record<string, unknown>;
  }) => api.post<{ data: WorkPlanSubmission }>("/work-plans", dto).then((r) => r.data.data),

  update: (
    id: string,
    dto: {
      farmEstateId?: string;
      totalAreaHa?: number | null;
      budgetYearLabel?: string;
      budgetYearGc?: number;
      fxEtbPerUsd?: number;
    },
  ) => api.patch<{ data: WorkPlanSubmission }>(`/work-plans/${id}`, dto).then((r) => r.data.data),

  updateParsed: (id: string, parsedJson: Record<string, unknown>) =>
    api.patch<{ data: WorkPlanSubmission }>(`/work-plans/${id}/parsed`, { parsedJson }).then((r) => r.data.data),

  uploadExcel: async (id: string, file: File, sectionCode: string) => {
    const buffer = await file.arrayBuffer();
    const res = await api.put<{ data: WorkPlanSubmission }>(`/work-plans/${id}/upload`, buffer, {
      params: { sectionCode },
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    });
    return res.data.data;
  },

  submit: (id: string) => api.post<{ data: WorkPlanSubmission }>(`/work-plans/${id}/submit`).then((r) => r.data.data),

  requestRevision: (id: string, notes: string) =>
    api.post<{ data: WorkPlanSubmission }>(`/work-plans/${id}/request-revision`, { notes }).then((r) => r.data.data),

  reject: (id: string, notes: string) =>
    api.post<{ data: WorkPlanSubmission }>(`/work-plans/${id}/reject`, { notes }).then((r) => r.data.data),

  accept: (id: string, body?: { notes?: string; year?: number }) =>
    api.post<{ data: { submission: WorkPlanSubmission; promote: { afpCount: number; blockCount: number } } }>(
      `/work-plans/${id}/accept`,
      body,
    ).then((r) => r.data.data),
};

export type AfpLineSchedule = {
  afpLineId: string;
  year: number;
  budgetAllocatedEtb: number | null;
  budgetAllocatedUsd: number;
  months: Array<{ month: number; plannedCostEtb: number; plannedCostUsd: number | null }>;
};

export const afpScheduleApi = {
  get: (afpLineId: string) =>
    api.get<{ data: AfpLineSchedule }>(`/afp-lines/${afpLineId}/schedule`).then((r) => r.data.data),
};
