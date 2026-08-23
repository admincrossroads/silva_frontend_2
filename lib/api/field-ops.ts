import api from "./index";

export type IfsFormType =
  | "daily_work_log"
  | "pruning_completion"
  | "fertilizer_application"
  | "pest_disease_scout"
  | "harvest_cherry_intake"
  | "safety_stop_work"
  | "equipment_downtime"
  | "weather_field_readiness"
  | "labor_attendance"
  | "block_inspection";

export const ifsFormApi = {
  catalog: () => api.get("/ifs-forms/catalog").then((r) => r.data.data),
  findAll: (params?: Record<string, unknown>) =>
    api.get("/ifs-forms", { params }).then((r) => r.data.data),
  findById: (id: string) => api.get(`/ifs-forms/${id}`).then((r) => r.data.data),
  create: (body: Record<string, unknown>) => api.post("/ifs-forms", body).then((r) => r.data.data),
  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/ifs-forms/${id}`, body).then((r) => r.data.data),
  submit: (id: string) => api.post(`/ifs-forms/${id}/submit`, {}).then((r) => r.data.data),
  validate: (id: string) => api.post(`/ifs-forms/${id}/validate`, {}).then((r) => r.data.data),
  reject: (id: string, reason: string) =>
    api.post(`/ifs-forms/${id}/reject`, { reason }).then((r) => r.data.data),
  vendorReview: (id: string) =>
    api.post(`/ifs-forms/${id}/vendor-review`, {}).then((r) => r.data.data),
  setIncludeInReport: (id: string, includeInSilvaReport: boolean) =>
    api.patch(`/ifs-forms/${id}/include-in-report`, { includeInSilvaReport }).then((r) => r.data.data),
};

export const seasonCalendarApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/season-calendars", { params }).then((r) => r.data.data),
  findById: (id: string) => api.get(`/season-calendars/${id}`).then((r) => r.data.data),
  create: (body: { year: number; name: string; notes?: string }) =>
    api.post("/season-calendars", body).then((r) => r.data.data),
  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/season-calendars/${id}`, body).then((r) => r.data.data),
  addWindow: (
    calendarId: string,
    body: {
      operatingDiscipline: string;
      activity: string;
      weekStart: number;
      weekEnd: number;
      linkedWorkOrderId?: string;
      notes?: string;
    },
  ) => api.post(`/season-calendars/${calendarId}/windows`, body).then((r) => r.data.data),
  issueWindow: (windowId: string) =>
    api.post(`/season-windows/${windowId}/issue`, {}).then((r) => r.data.data),
  startWindow: (windowId: string) =>
    api.post(`/season-windows/${windowId}/start`, {}).then((r) => r.data.data),
  completeWindow: (windowId: string, body?: { notes?: string }) =>
    api.post(`/season-windows/${windowId}/complete`, body || {}).then((r) => r.data.data),
};
