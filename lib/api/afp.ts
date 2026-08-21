import api from "./index";

export const afpApi = {
  findAll: (params?: { year?: number; status?: string; page?: number; pageSize?: number }) =>
    api.get("/afp-lines", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/afp-lines/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) =>
    api.post("/afp-lines", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/afp-lines/${id}`, dto).then((r) => r.data.data),

  submit: (id: string, comment: string) =>
    api.post(`/afp-lines/${id}/submit`, { comment }).then((r) => r.data.data),

  approve: (id: string, comment: string) =>
    api.post(`/afp-lines/${id}/approve`, { comment }).then((r) => r.data.data),

  close: (id: string, comment: string) =>
    api.post(`/afp-lines/${id}/close`, { comment }).then((r) => r.data.data),
};
