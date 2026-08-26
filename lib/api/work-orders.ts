import api from "./index";

export const workOrderApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/work-orders", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/work-orders/${id}`).then((r) => r.data.data),

  create: (dto: Record<string, unknown>) =>
    api.post("/work-orders", dto).then((r) => r.data.data),

  update: (id: string, dto: Record<string, unknown>) =>
    api.patch(`/work-orders/${id}`, dto).then((r) => r.data.data),

  issue: (id: string, comment: string) =>
    api.post(`/work-orders/${id}/issue`, { comment }).then((r) => r.data.data),

  start: (id: string) =>
    api.post(`/work-orders/${id}/start`, {}).then((r) => r.data.data),

  complete: (id: string) =>
    api.post(`/work-orders/${id}/complete`, {}).then((r) => r.data.data),

  close: (id: string, comment: string) =>
    api.post(`/work-orders/${id}/close`, { comment }).then((r) => r.data.data),

  listAssignments: (id: string) =>
    api.get(`/work-orders/${id}/assignments`).then((r) => r.data.data),

  addAssignment: (id: string, body: { userId: string; roleOnOrder?: string; isPrimary?: boolean }) =>
    api.post(`/work-orders/${id}/assignments`, body).then((r) => r.data.data),

  patchAssignment: (
    id: string,
    assignmentId: string,
    body: { isPrimary?: boolean; active?: boolean; roleOnOrder?: string },
  ) => api.patch(`/work-orders/${id}/assignments/${assignmentId}`, body).then((r) => r.data.data),
};
