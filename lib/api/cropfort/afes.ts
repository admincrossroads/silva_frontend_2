import api from "../index";

export type CropfortAfeStatus = "draft" | "submitted" | "approved" | "returned";
export type CropfortAfeBand = "A" | "B" | "C" | "D";
export type CropfortAfeSourceType = "afp_line" | "weekly_submission" | "intervention" | "manual";

export interface CropfortAfe {
  id: string;
  programId: string;
  title: string;
  amountEtb: number;
  band: CropfortAfeBand;
  sourceType: CropfortAfeSourceType;
  sourceId?: string | null;
  status: CropfortAfeStatus;
  version: number;
  returnedComment?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
}

export interface CreateCropfortAfeDto {
  title: string;
  amountEtb: number;
  sourceType: CropfortAfeSourceType;
  sourceId?: string | null;
}

export interface BandPreview {
  amountEtb: number;
  band: CropfortAfeBand;
  thresholds: {
    bandAMaxEtb: number;
    bandBMaxEtb: number;
    bandCMaxEtb: number;
  };
}

export const cropfortAfesApi = {
  list: (params?: { status?: string; band?: string; sourceType?: string }) =>
    api.get<{ data: CropfortAfe[] }>("/cropfort/afes", { params }).then((r) => r.data.data),

  previewBand: (amountEtb: number) =>
    api
      .get<{ data: BandPreview }>("/cropfort/afes/band-preview", { params: { amountEtb } })
      .then((r) => r.data.data),

  create: (dto: CreateCropfortAfeDto) =>
    api.post<{ data: CropfortAfe }>("/cropfort/afes", dto).then((r) => r.data.data),

  update: (afeId: string, dto: Partial<CreateCropfortAfeDto>) =>
    api.patch<{ data: CropfortAfe }>(`/cropfort/afes/${afeId}`, dto).then((r) => r.data.data),

  submit: (afeIds: string[]) =>
    api.post<{ data: CropfortAfe[] }>("/cropfort/afes/submit", { afeIds }).then((r) => r.data.data),

  approve: (afeId: string, comment?: string) =>
    api.post<{ data: CropfortAfe }>(`/cropfort/afes/${afeId}/approve`, { comment: comment ?? "" }).then((r) => r.data.data),

  returnAfe: (afeId: string, comment: string) =>
    api.post<{ data: CropfortAfe }>(`/cropfort/afes/${afeId}/return`, { comment }).then((r) => r.data.data),
};
