import api from "./index";

export const reportApi = {
  findAll: (params?: Record<string, unknown>) =>
    api.get("/reports", { params }).then((r) => r.data.data),

  findById: (id: string) =>
    api.get(`/reports/${id}`).then((r) => r.data.data),

  generateWeekly: () => api.post("/reports/generate/weekly", {}).then((r) => r.data.data),

  generateMonthly: () => api.post("/reports/generate/monthly", {}).then((r) => r.data.data),

  generateQuarterly: () => api.post("/reports/generate/quarterly", {}).then((r) => r.data.data),

  generateAnnual: () => api.post("/reports/generate/annual", {}).then((r) => r.data.data),

  patchNarrative: (id: string, narrative: string) =>
    api.patch(`/reports/${id}/narrative`, { narrative }).then((r) => r.data.data),

  release: (id: string) => api.post(`/reports/${id}/release`, {}).then((r) => r.data.data),
};
