import api from "./index";

export const paymentRequestApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/payment-requests", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/payment-requests/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) =>
    api.post("/payment-requests", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/payment-requests/${id}`, dto).then((r) => r.data.data),

  submit: (id: string) =>
    api.post(`/payment-requests/${id}/submit`, {}).then((r) => r.data.data),

  verify: (id: string) =>
    api.post(`/payment-requests/${id}/verify`, {}).then((r) => r.data.data),

  reject: (id: string, reason: string) =>
    api.post(`/payment-requests/${id}/reject`, { reason }).then((r) => r.data.data),

  settle: (id: string, settlementId: string) =>
    api.post(`/payment-requests/${id}/settle`, { settlementId }).then((r) => r.data.data),
};
