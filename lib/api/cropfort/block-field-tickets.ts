import api from "../index";

export type BlockFieldTicketStatus =
  | "draft"
  | "submitted"
  | "reviewed_approved"
  | "reviewed_flagged"
  | "reviewed_returned"
  | "released";

export interface BlockFieldTicket {
  id: string;
  programId?: string;
  blockId: string;
  block?: { id: string; code: string; label?: string | null };
  activityId: string;
  activity?: { id: string; code: string; name: string };
  weekEnding: string;
  plannedQty?: number | null;
  actualQty: number;
  laborHoursActual: number;
  materialsUsed?: Record<string, unknown> | null;
  evidenceUrls?: string[];
  clientLocalId?: string | null;
  spxNote?: string | null;
  status: BlockFieldTicketStatus;
  supersedesId?: string | null;
  submittedAt?: string | null;
  releasedAt?: string | null;
}

export interface CreateBlockFieldTicketDto {
  blockId: string;
  activityId: string;
  weekEnding: string;
  plannedQty?: number | null;
  actualQty: number;
  laborHoursActual: number;
  materialsUsed?: Record<string, unknown> | null;
  evidenceUrls?: string[];
  clientLocalId?: string | null;
}

export const blockFieldTicketsApi = {
  list: (params?: { weekEnding?: string; blockId?: string; status?: string }) =>
    api.get<{ data: BlockFieldTicket[] }>("/cropfort/block-field-tickets", { params }).then((r) => r.data.data),

  create: (dto: CreateBlockFieldTicketDto) =>
    api.post<{ data: BlockFieldTicket }>("/cropfort/block-field-tickets", dto).then((r) => r.data.data),

  update: (ticketId: string, dto: Partial<CreateBlockFieldTicketDto>) =>
    api.patch<{ data: BlockFieldTicket }>(`/cropfort/block-field-tickets/${ticketId}`, dto).then((r) => r.data.data),

  submit: (ticketId: string) =>
    api.post<{ data: BlockFieldTicket }>(`/cropfort/block-field-tickets/${ticketId}/submit`).then((r) => r.data.data),

  review: (
    ticketId: string,
    body: { status: "reviewed_approved" | "reviewed_flagged" | "reviewed_returned"; spxNote?: string },
  ) =>
    api
      .post<{ data: BlockFieldTicket }>(`/cropfort/block-field-tickets/${ticketId}/review`, body)
      .then((r) => r.data.data),

  sync: (
    tickets: (CreateBlockFieldTicketDto & { clientLocalId: string; status?: "draft" | "submitted" })[],
  ) =>
    api
      .post<{
        data: {
          clientLocalId: string;
          status: string;
          ticket: BlockFieldTicket;
          conflictWith?: string;
        }[];
      }>("/cropfort/block-field-tickets/sync", { tickets })
      .then((r) => r.data.data),

  uploadPhoto: (body: { fileName: string; contentType: string; dataBase64: string; clientLocalId?: string }) =>
    api.post<{ data: { url: string; storageKey: string } }>("/cropfort/block-field-tickets/upload-photo", body).then((r) => r.data.data),
};
