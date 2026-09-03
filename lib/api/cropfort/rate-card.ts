import api from "../index";

export type RateCardLineStatus = "draft" | "submitted" | "approved" | "returned";

export interface RateCardLine {
  id: string;
  programId: string;
  resourceCode: string;
  resourceName: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRateCardLineDto {
  resourceCode: string;
  resourceName: string;
  unitOfMeasure: string;
  rateEtb: number;
  benchmarkFarmARate?: number | null;
  benchmarkFarmBRate?: number | null;
  spxJustificationNote?: string | null;
}

export const rateCardApi = {
  list: (params?: { status?: string }) =>
    api.get<{ data: RateCardLine[] }>("/cropfort/rate-card", { params }).then((r) => r.data.data),

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
