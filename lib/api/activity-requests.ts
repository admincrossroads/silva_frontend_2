import api from "./index";

export type ActivityRequestType =
  | "coffee_testing"
  | "farm_status_assessment"
  | "soil_analysis"
  | "quality_audit"
  | "infrastructure_inspection"
  | "urgent_field_work"
  | "other";

export type ActivityRequestStatus = "submitted" | "converted" | "dismissed";
export type ActivityRequestOrigin = "silva_request" | "vendor_request";

export interface ActivityRequest {
  id: string;
  programId: string;
  farmEstateId: string | null;
  requestType: ActivityRequestType;
  title: string;
  description: string | null;
  urgency: "normal" | "high" | "urgent";
  blocksOrAreas: string | null;
  blockCode: string | null;
  status: ActivityRequestStatus;
  origin: ActivityRequestOrigin;
  requestedByUserId: string;
  vendorId: string | null;
  activityCatalogId: string | null;
  workPlanSubmissionId: string | null;
  suggestedAfpLineId: string | null;
  convertedAfeId: string | null;
  dismissalReason: string | null;
  convertedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
  farmEstate?: { id: string; name: string } | null;
  activityCatalog?: {
    id: string;
    nameEn: string;
    sectionLabel: string;
    afpLineId: string;
  } | null;
  suggestedAfpLine?: {
    id: string;
    activity: string;
    operatingDiscipline: string;
  } | null;
  requestedBy?: { id: string; name: string; email: string } | null;
  convertedAfe?: Record<string, unknown> | null;
}

export interface WorkListOptions {
  workPlans: Array<{
    id: string;
    budgetYearLabel: string;
    budgetYearGc: number;
    farmEstateId: string | null;
    farmEstateName: string | null;
    vendorName: string | null;
    sections: Array<{
      sectionCode: string;
      sectionLabel: string;
      afpLineId: string;
      activities: Array<{ id: string; nameEn: string; unit: string }>;
    }>;
  }>;
  catalog: Array<{
    id: string;
    nameEn: string;
    sectionCode: string;
    sectionLabel: string;
    afpLineId: string;
    operatingDiscipline: string;
    afpActivity: string | null;
  }>;
  afpLines: Array<{
    id: string;
    year: number;
    operatingDiscipline: string;
    activity: string;
    status: string;
    workPlanSubmissionId: string | null;
  }>;
}

export const activityRequestApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/activity-requests", { params }).then((r) => r.data.data as ActivityRequest[]),
  findById: (id: string) =>
    api.get(`/activity-requests/${id}`).then((r) => r.data.data as ActivityRequest),
  create: (body: Record<string, unknown>) =>
    api.post("/activity-requests", body).then((r) => r.data.data as ActivityRequest),
  convert: (id: string, body: Record<string, unknown>) =>
    api.post(`/activity-requests/${id}/convert`, body).then((r) => r.data.data as ActivityRequest),
  dismiss: (id: string, reason: string) =>
    api.post(`/activity-requests/${id}/dismiss`, { reason }).then((r) => r.data.data as ActivityRequest),
  workListOptions: () =>
    api.get("/activity-requests/work-list-options").then((r) => r.data.data as WorkListOptions),
};
