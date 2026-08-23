import api from "./index";

export type ActivityRequestType =
  | "coffee_testing"
  | "farm_status_assessment"
  | "soil_analysis"
  | "quality_audit"
  | "infrastructure_inspection";

export type ActivityRequest = {
  id: string;
  requestType: ActivityRequestType;
  title: string;
  description: string;
  urgency: string;
  blocksOrAreas?: string | null;
  status: "submitted" | "converted" | "dismissed";
  origin: string;
  convertedAfeId?: string | null;
  createdAt: string;
};

export const activityRequestApi = {
  create: (body: {
    requestType: ActivityRequestType;
    title: string;
    description: string;
    urgency?: string;
    blocksOrAreas?: string;
  }) => api.post("/activity-requests", body).then((r) => r.data.data as ActivityRequest),
  findAll: (params?: Record<string, unknown>) =>
    api.get("/activity-requests", { params }).then((r) => r.data.data as ActivityRequest[]),
  convert: (
    id: string,
    body: {
      operatingDiscipline: string;
      estimatedCostUsd: number;
      afpLineId?: string | null;
      description?: string;
    },
  ) => api.post(`/activity-requests/${id}/convert`, body).then((r) => r.data.data),
  dismiss: (id: string, reason: string) =>
    api.post(`/activity-requests/${id}/dismiss`, { reason }).then((r) => r.data.data),
};
