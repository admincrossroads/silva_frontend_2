import api from "./index";

export const settlementApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/owner-settlements", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/owner-settlements/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) =>
    api.post("/owner-settlements", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/owner-settlements/${id}`, dto).then((r) => r.data.data),

  authorize: (id: string) =>
    api.post(`/owner-settlements/${id}/authorize`, {}).then((r) => r.data.data),

  markSettled: (id: string) =>
    api.post(`/owner-settlements/${id}/mark-settled`, {}).then((r) => r.data.data),
};
