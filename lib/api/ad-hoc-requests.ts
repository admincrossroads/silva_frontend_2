import api from "./index";

export type CoreOperationKind = "intervention" | "project";
export type AdHocRequestStatus = "draft" | "submitted" | "converted" | "dismissed";
export type AdHocUrgency = "low" | "normal" | "high" | "emergency";
export type AdHocOrigin = "silva_request" | "vendor_request";

export type CoreOperationProject = {
  id: string;
  status: "active" | "complete" | "closed";
  startDate: string;
  endDate: string;
  cropfortAfeId?: string | null;
};

export type CropfortAfeSummary = {
  id: string;
  title?: string;
  status: string;
  band: string;
  sourceType?: string;
  amountEtb?: number;
};

export type AdHocRequest = {
  id: string;
  programId: string;
  title: string;
  description: string | null;
  operatingDiscipline: string;
  operationKind: CoreOperationKind;
  urgency: AdHocUrgency;
  estimatedCostUsd: number | null;
  estimatedAmountEtb: number | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  blockIds: string[];
  activityIds: string[];
  farmEstateId: string | null;
  suggestedAfpLineId: string | null;
  status: AdHocRequestStatus;
  origin?: AdHocOrigin;
  vendorId?: string | null;
  requestedByUserId: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  convertedAfeId: string | null;
  convertedCropfortAfeId: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestedBy?: { id: string; name: string; email: string };
  reviewedBy?: { id: string; name: string };
  farmEstate?: { id: string; name: string };
  vendor?: { id: string; name: string };
  suggestedAfpLine?: {
    id: string;
    activity: string;
    operatingDiscipline: string;
    year: number;
    status: string;
  };
  convertedAfe?: { id: string; status: string; band: string };
  convertedCropfortAfe?: CropfortAfeSummary;
  coreOperationProject?: CoreOperationProject;
};

export type CoreOperationStats = {
  submittedInterventions: number;
  submittedProjects: number;
  activeProjects: number;
};

export const adHocRequestsApi = {
  findAll: (params?: {
    status?: string;
    urgency?: string;
    origin?: string;
    operationKind?: CoreOperationKind;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) => api.get("/ad-hoc-requests", { params }).then((r) => r.data.data as AdHocRequest[]),

  stats: () => api.get("/ad-hoc-requests/stats/summary").then((r) => r.data.data as CoreOperationStats),

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

  convertCropfort: (id: string, dto: { title?: string; amountEtb?: number; notes?: string }) =>
    api.post(`/ad-hoc-requests/${id}/convert-cropfort`, dto).then((r) => r.data.data as {
      request: AdHocRequest;
      cropfortAfe: CropfortAfeSummary & { amountEtb: number };
      project: CoreOperationProject | null;
    }),
};
