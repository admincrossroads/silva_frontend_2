import api from "./index";

export type AdHocRequestStatus = "draft" | "submitted" | "converted" | "dismissed";
export type AdHocUrgency = "low" | "normal" | "high" | "emergency";

export type AdHocRequest = {
  id: string;
  programId: string;
  title: string;
  description: string | null;
  operatingDiscipline: string;
  urgency: AdHocUrgency;
  estimatedCostUsd: number | null;
  farmEstateId: string | null;
  suggestedAfpLineId: string | null;
  status: AdHocRequestStatus;
  requestedByUserId: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  convertedAfeId: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy?: { id: string; name: string; email: string };
  reviewedBy?: { id: string; name: string };
  farmEstate?: { id: string; name: string };
  suggestedAfpLine?: {
    id: string;
    activity: string;
    operatingDiscipline: string;
    year: number;
    status: string;
  };
  convertedAfe?: { id: string; status: string; band: string };
};

export const adHocRequestsApi = {
  findAll: (params?: { status?: string; urgency?: string; page?: number; pageSize?: number }) =>
    api.get("/ad-hoc-requests", { params }).then((r) => r.data.data as AdHocRequest[]),

  findById: (id: string) =>
    api.get(`/ad-hoc-requests/${id}`).then((r) => r.data.data as AdHocRequest),

  create: (dto: Record<string, unknown>) =>
    api.post("/ad-hoc-requests", dto).then((r) => r.data.data as AdHocRequest),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/ad-hoc-requests/${id}`, dto).then((r) => r.data.data as AdHocRequest),

  submit: (id: string) =>
    api.post(`/ad-hoc-requests/${id}/submit`).then((r) => r.data.data as AdHocRequest),

  dismiss: (id: string, notes: string) =>
    api.post(`/ad-hoc-requests/${id}/dismiss`, { notes }).then((r) => r.data.data as AdHocRequest),

  convert: (id: string, dto: Record<string, unknown>) =>
    api.post(`/ad-hoc-requests/${id}/convert`, dto).then((r) => r.data.data as {
      request: AdHocRequest;
      afe: { id: string; status: string; band: string; planningMode: string; afpLineId: string };
    }),
};
