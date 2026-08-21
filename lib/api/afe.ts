import api from "./index";

export const afeApi = {
  findAll: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get("/afes", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/afes/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) =>
    api.post("/afes", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/afes/${id}`, dto).then((r) => r.data.data),

  submit: (id: string, comment: string) =>
    api.post(`/afes/${id}/submit`, { comment }).then((r) => r.data.data),

  validate: (id: string, comment: string) =>
    api.post(`/afes/${id}/validate`, { comment }).then((r) => r.data.data),

  approve: (id: string, comment: string) =>
    api.post(`/afes/${id}/approve`, { comment }).then((r) => r.data.data),

  reject: (id: string, reason: string) =>
    api.post(`/afes/${id}/reject`, { reason }).then((r) => r.data.data),

  close: (id: string, comment: string) =>
    api.post(`/afes/${id}/close`, { comment }).then((r) => r.data.data),

  history: (id: string) =>
    api.get(`/afes/${id}/history`).then((r) => r.data.data),
};
