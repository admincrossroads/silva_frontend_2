import api from "./index";

export type MessageCounterpartyType = "vendor" | "asset_owner";
export type MessageThreadStatus = "open" | "archived";

export type MessageAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type MessageThread = {
  id: string;
  programId: string;
  spxOrganizationId: string;
  spxOrganizationName: string | null;
  counterpartyOrganizationId: string;
  counterpartyOrganizationName: string | null;
  counterpartyType: MessageCounterpartyType;
  subject: string;
  status: MessageThreadStatus;
  entityType: string | null;
  entityId: string | null;
  createdByUserId: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessagePreview: string | null;
  lastMessageSenderName: string | null;
  firstMessageId?: string;
};

export type MessageItem = {
  id: string;
  threadId: string;
  senderUserId: string;
  senderName: string;
  senderOrganizationId: string;
  senderOrganizationName: string | null;
  body: string;
  createdAt: string;
  attachments: MessageAttachment[];
};

export type MessageCounterparty = {
  organizationId: string;
  name: string;
  type: string;
  vendorId: string | null;
  vendorName: string | null;
};

export type CreateThreadDto = {
  subject: string;
  body: string;
  counterpartyType?: MessageCounterpartyType;
  counterpartyOrganizationId?: string;
  entityType?: string;
  entityId?: string;
};

export const messagesApi = {
  listCounterparties: (type: MessageCounterpartyType) =>
    api
      .get<{ data: MessageCounterparty[] }>("/messages/counterparties", { params: { type } })
      .then((r) => r.data.data),

  listThreads: (params?: { counterpartyType?: MessageCounterpartyType; status?: string }) =>
    api.get<{ data: MessageThread[] }>("/messages/threads", { params }).then((r) => r.data.data),

  createThread: (dto: CreateThreadDto) =>
    api.post<{ data: MessageThread }>("/messages/threads", dto).then((r) => r.data.data),

  getThread: (threadId: string) =>
    api
      .get<{ data: { thread: MessageThread; messages: MessageItem[] } }>(`/messages/threads/${threadId}`)
      .then((r) => r.data.data),

  reply: (threadId: string, body: string) =>
    api
      .post<{ data: MessageItem }>(`/messages/threads/${threadId}/messages`, { body })
      .then((r) => r.data.data),

  markRead: (threadId: string) =>
    api.post<{ data: { threadId: string; lastReadAt: string } }>(`/messages/threads/${threadId}/read`, {}).then(
      (r) => r.data.data,
    ),

  patchThread: (
    threadId: string,
    dto: { status?: MessageThreadStatus; entityType?: string | null; entityId?: string | null },
  ) => api.patch<{ data: MessageThread }>(`/messages/threads/${threadId}`, dto).then((r) => r.data.data),
};
