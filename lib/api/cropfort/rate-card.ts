import api from "../index";

export type RateCardLineStatus = "draft" | "submitted" | "approved" | "returned";
export type RateCardResourceType = "material" | "service";

export interface RateCardLine {
  id: string;
  programId?: string;
  resourceCode: string;
  resourceName: string;
  resourceType?: RateCardResourceType | string | null;
  unitOfMeasure: string;
  rateEtb: number | string;
  benchmarkFarmARate?: number | string | null;
  benchmarkFarmBRate?: number | string | null;
  spxJustificationNote?: string | null;
  status: RateCardLineStatus;
  version: number;
  variancePct?: number | null;
  isFlagged?: boolean;
  returnedComment?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRateCardLineDto {
  resourceCode: string;
  resourceName: string;
  resourceType?: RateCardResourceType | null;
  unitOfMeasure: string;
  rateEtb: number;
  benchmarkFarmARate?: number | null;
  benchmarkFarmBRate?: number | null;
  spxJustificationNote?: string | null;
}

export interface RateCardMeta {
  programId: string;
  flagThresholdPct: number;
  counts: {
    draft: number;
    submitted: number;
    approved: number;
    returned: number;
    labor: number;
  };
}

export interface LaborRateCard {
  id: string;
  programId: string;
  farmEstateId: string;
  farmEstateName: string | null;
  activityId: string;
  activityCode: string | null;
  activityName: string | null;
  normMandayPerUnit: number | null;
  wageRatePerManday: number | null;
  status: string;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export const rateCardApi = {
  list: (params?: { status?: string; resourceType?: string; farmEstateId?: string }) =>
    api.get<{ data: RateCardLine[] }>("/cropfort/rate-card", { params }).then((r) => r.data.data),

  meta: () => api.get<{ data: RateCardMeta }>("/cropfort/rate-card/meta").then((r) => r.data.data),

  listLabor: (params?: { farmEstateId?: string; status?: string }) =>
    api
      .get<{ data: LaborRateCard[] }>("/cropfort/labor-rate-cards", { params })
      .then((r) => r.data.data),

  create: (dto: CreateRateCardLineDto) =>
    api.post<{ data: RateCardLine }>("/cropfort/rate-card", dto).then((r) => r.data.data),

  update: (lineId: string, dto: Partial<CreateRateCardLineDto>) =>
    api.patch<{ data: RateCardLine }>(`/cropfort/rate-card/${lineId}`, dto).then((r) => r.data.data),

  submit: (lineIds: string[]) =>
    api.post<{ data: RateCardLine[] }>("/cropfort/rate-card/submit", { lineIds }).then((r) => r.data.data),

  approveLine: (lineId: string, comment?: string) =>
    api
      .post<{ data: RateCardLine }>(`/cropfort/rate-card/${lineId}/approve`, { comment: comment ?? "" })
      .then((r) => r.data.data),

  returnLine: (lineId: string, comment: string) =>
    api
      .post<{ data: RateCardLine }>(`/cropfort/rate-card/${lineId}/return`, { comment })
      .then((r) => r.data.data),

  reopenLine: (lineId: string) =>
    api.post<{ data: RateCardLine }>(`/cropfort/rate-card/${lineId}/reopen`).then((r) => r.data.data),
};
