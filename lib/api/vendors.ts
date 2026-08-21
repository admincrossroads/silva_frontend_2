import api from "./index";

export const vendorApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/vendors", { params }).then((r) => r.data.data),

  findById: (id: string) => api.get(`/vendors/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) => api.post("/vendors", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/vendors/${id}`, dto).then((r) => r.data.data),

  activate: (id: string) => api.post(`/vendors/${id}/activate`, {}).then((r) => r.data.data),

  deactivate: (id: string) => api.post(`/vendors/${id}/deactivate`, {}).then((r) => r.data.data),

  listUsers: (vendorId: string) =>
    api.get(`/vendors/${vendorId}/users`).then((r) => r.data.data),

  inviteUser: (vendorId: string, body: { email: string; role: string }) =>
    api.post(`/vendors/${vendorId}/users/invite`, body).then((r) => r.data.data),

  listScorecards: (params?: { vendorId?: string; reviewPeriod?: string }) =>
    api.get("/vendor-scorecards", { params }).then((r) => r.data.data),

  listContracts: (params?: { vendorId?: string }) =>
    api.get("/vendor-contracts", { params }).then((r) => r.data.data),
};
