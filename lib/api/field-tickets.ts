import api from "./index";

export const fieldTicketApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/field-tickets", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/field-tickets/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) =>
    api.post("/field-tickets", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/field-tickets/${id}`, dto).then((r) => r.data.data),

  submit: (id: string) =>
    api.post(`/field-tickets/${id}/submit`, {}).then((r) => r.data.data),

  vendorReview: (id: string) =>
    api.post(`/field-tickets/${id}/vendor-review`, {}).then((r) => r.data.data),

  validate: (id: string, comment: string) =>
    api.post(`/field-tickets/${id}/validate`, { comment }).then((r) => r.data.data),

  reject: (id: string, reason: string) =>
    api.post(`/field-tickets/${id}/reject`, { reason }).then((r) => r.data.data),
};
