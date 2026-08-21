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

  listAccountabilityMatrix: () => api.get("/accountability-matrix").then((r) => r.data.data),

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
};
