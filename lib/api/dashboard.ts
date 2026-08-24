import api from "./index";

export const dashboardApi = {
  silvaOwner: (year?: number) =>
    api.get("/dashboard/silva-owner", { params: { year } }).then((r) => r.data.data),

  spxManagement: (year?: number) =>
    api.get("/dashboard/spx-management", { params: { year } }).then((r) => r.data.data),

  vendorField: () => api.get("/dashboard/vendor-field").then((r) => r.data.data),

  actionQueues: () => api.get("/dashboard/action-queues").then((r) => r.data.data),

  budgetVsActual: (year?: number) =>
    api.get("/budget-vs-actual", { params: { year, pageSize: 100 } }).then((r) => r.data.data),

  budgetVsActualSummary: (year?: number) =>
    api.get("/budget-vs-actual/summary", { params: { year } }).then((r) => r.data.data),
};
