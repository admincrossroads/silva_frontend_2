import api from "./index";

export const platformApi = {
  listUsers: (params?: { page?: number; pageSize?: number }) =>
    api.get("/users", { params: { page: 1, pageSize: 50, ...params } }).then((r) => r.data.data),

  listOrganizations: (params?: { page?: number; pageSize?: number }) =>
    api.get("/organizations", { params: { page: 1, pageSize: 50, ...params } }).then((r) => r.data.data),

  getOrganization: (organizationId: string) =>
    api.get(`/organizations/${organizationId}`).then((r) => r.data.data),

  listMembers: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/members`).then((r) => r.data.data),

  listInvites: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/invites`).then((r) => r.data.data),

  listSchedule3: () => api.get("/schedule3-thresholds").then((r) => r.data.data),

  listSchedule4: () => api.get("/schedule4-insurance").then((r) => r.data.data),

  listDisclosures: () => api.get("/related-party-disclosures").then((r) => r.data.data),

  createDisclosure: (body: { party: string; relationship: string; period: string; notes?: string }) =>
    api.post("/related-party-disclosures", body).then((r) => r.data.data),

  patchDisclosure: (id: string, body: Record<string, unknown>) =>
    api.patch(`/related-party-disclosures/${id}`, body).then((r) => r.data.data),

  listAccountabilityMatrix: () => api.get("/accountability-matrix").then((r) => r.data.data),

  createAccountability: (body: Record<string, string>) =>
    api.post("/accountability-matrix", body).then((r) => r.data.data),

  patchAccountability: (discipline: string, body: Record<string, string>) =>
    api.patch(`/accountability-matrix/${encodeURIComponent(discipline)}`, body).then((r) => r.data.data),

  listCoa: () => api.get("/coa-mapping").then((r) => r.data.data),

  createCoa: (body: { sourceAccount: string; glAccount: string; description?: string }) =>
    api.post("/coa-mapping", body).then((r) => r.data.data),

  patchCoa: (id: string, body: Record<string, unknown>) =>
    api.patch(`/coa-mapping/${id}`, body).then((r) => r.data.data),

  listGlExports: () => api.get("/gl-journal-exports").then((r) => r.data.data),

  generateGlExport: (body: { period: string }) =>
    api.post("/gl-journal-exports/generate", body).then((r) => r.data.data),

  getGlExport: (id: string) => api.get(`/gl-journal-exports/${id}`).then((r) => r.data.data),

  listAttachments: (params: { entityType: string; entityId: string }) =>
    api.get("/attachments", { params }).then((r) => r.data.data),

  requestUploadUrl: (body: {
    entityType: string;
    entityId: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) => api.post("/attachments/upload-url", body).then((r) => r.data.data),

  createAttachment: (body: Record<string, unknown>) =>
    api.post("/attachments", body).then((r) => r.data.data),

  getAttachment: (id: string) => api.get(`/attachments/${id}`).then((r) => r.data.data),

  deleteAttachment: (id: string) => api.delete(`/attachments/${id}`).then((r) => r.data.data),

  listNotifications: (params?: { acknowledged?: "true" | "false" }) =>
    api.get("/notifications", { params }).then((r) => r.data.data),

  acknowledgeNotification: (id: string) =>
    api.post(`/notifications/${id}/acknowledge`, {}).then((r) => r.data.data),

  deactivateUser: (id: string) =>
    api.post(`/users/${id}/deactivate`, {}).then((r) => r.data.data),

  createOrganizationInvite: (organizationId: string, body: { email: string; role: string }) =>
    api.post(`/organizations/${organizationId}/invites`, body).then((r) => r.data.data),

  listRevenue: (params?: Record<string, unknown>) =>
    api.get("/revenue-ledger", { params }).then((r) => r.data.data),

  listAudit: (params?: Record<string, unknown>) =>
    api.get("/audit-log", { params }).then((r) => r.data.data),

  getAudit: (id: string) => api.get(`/audit-log/${id}`).then((r) => r.data.data),
};
