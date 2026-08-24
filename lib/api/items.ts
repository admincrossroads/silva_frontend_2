import api from "./index";

export type ItemActivityEntry = {
  id: string;
  timestamp: string;
  type: "comment" | "status_change" | "validation";
  userId: string;
  userName: string;
  content?: string;
  oldState?: unknown;
  newState?: unknown;
  comment?: string;
  action?: string;
  mentions?: string[];
};

export const itemActivityApi = {
  list: (entityType: string, entityId: string) =>
    api
      .get<{ data: ItemActivityEntry[] }>(`/items/${entityType}/${entityId}/activity`)
      .then((r) => r.data.data),

  addComment: (entityType: string, entityId: string, content: string) =>
    api
      .post<{ data: ItemActivityEntry }>(`/items/${entityType}/${entityId}/comments`, { content })
      .then((r) => r.data.data),
};
