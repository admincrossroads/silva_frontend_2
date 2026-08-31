import api from "../index";

export interface CropfortAuditEntry {
  id: string;
  programId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  actor?: { id: string; name: string; email: string } | null;
  timestamp: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export const cropfortAuditApi = {
  list: (params?: {
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    from?: string;
    to?: string;
    limit?: number;
  }) => api.get<{ data: CropfortAuditEntry[] }>("/cropfort/audit", { params }).then((r) => r.data.data),
};
