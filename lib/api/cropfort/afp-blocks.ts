import api from "../index";

export type AfpBlockLineStatus = "draft" | "submitted" | "approved" | "returned";
export type ElectionStatus = "suggested" | "elected";

export interface AfpBlockLine {
  id: string;
  programId?: string;
  planYear: number;
  blockId: string;
  block?: { id: string; code: string; label?: string | null };
  activityId: string;
  activity?: {
    id: string;
    code: string;
    name: string;
    laborNorm?: number | null;
    materialNorm?: number | null;
    serviceNorm?: number | null;
  } | null;
  electionStatus: ElectionStatus;
  sequence: number;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  plannedQty: number;
  status: AfpBlockLineStatus;
  version: number;
  returnedComment?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
}

export interface CreateAfpBlockLineDto {
  planYear: number;
  blockId: string;
  activityId: string;
  plannedQty: number;
  sequence?: number;
  plannedStart?: string | null;
  plannedEnd?: string | null;
}

export const afpBlocksApi = {
  list: (params?: { planYear?: number; blockId?: string; status?: string; electionStatus?: string }) =>
    api.get<{ data: AfpBlockLine[] }>("/cropfort/afp-blocks", { params }).then((r) => r.data.data),

  create: (dto: CreateAfpBlockLineDto) =>
    api.post<{ data: AfpBlockLine }>("/cropfort/afp-blocks", dto).then((r) => r.data.data),

  update: (lineId: string, dto: Partial<CreateAfpBlockLineDto>) =>
    api.patch<{ data: AfpBlockLine }>(`/cropfort/afp-blocks/${lineId}`, dto).then((r) => r.data.data),

  updateElection: (lineId: string, electionStatus: ElectionStatus) =>
    api
      .patch<{ data: AfpBlockLine }>(`/cropfort/afp-blocks/${lineId}/election`, { electionStatus })
      .then((r) => r.data.data),

  submit: (lineIds: string[]) =>
    api.post<{ data: AfpBlockLine[] }>("/cropfort/afp-blocks/submit", { lineIds }).then((r) => r.data.data),

  approveLine: (lineId: string, comment?: string) =>
    api
      .post<{ data: AfpBlockLine }>(`/cropfort/afp-blocks/${lineId}/approve`, { comment: comment ?? "" })
      .then((r) => r.data.data),

  returnLine: (lineId: string, comment: string) =>
    api
      .post<{ data: AfpBlockLine }>(`/cropfort/afp-blocks/${lineId}/return`, { comment })
      .then((r) => r.data.data),

  reopenLine: (lineId: string) =>
    api.post<{ data: AfpBlockLine }>(`/cropfort/afp-blocks/${lineId}/reopen`).then((r) => r.data.data),
};
