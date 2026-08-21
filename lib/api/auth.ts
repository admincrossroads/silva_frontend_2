import api from "./index";

import type { AuthMe, LoginResponse, ProgramInfo, TenantInfo } from "@/types";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ data: LoginResponse }>("/auth/login", { email, password }).then((r) => r.data.data),

  signup: (body: Record<string, unknown>) =>
    api.post<{ data: LoginResponse }>("/auth/signup", body).then((r) => r.data.data),

  me: () => api.get<{ data: AuthMe }>("/auth/me").then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }).then((r) => r.data.data),

  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) => api.post("/auth/password/forgot", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/password/reset", { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/password/change", { currentPassword, newPassword }).then((r) => r.data.data),

  updateProfile: (userId: string, body: { name?: string; email?: string }) =>
    api.patch(`/users/${userId}`, body).then((r) => r.data.data),

  switchProgram: (programId: string) =>
    api.post("/auth/switch-program", { programId }).then((r) => r.data.data),

  updateTenantBranding: (body: { displayName?: string; branding?: Record<string, unknown> }) =>
    api.patch<{ data: TenantInfo }>("/auth/tenant/branding", body).then((r) => r.data.data),
};

export const programApi = {
  list: () => api.get<{ data: ProgramInfo[] }>("/programs").then((r) => r.data.data),

  get: (programId: string) =>
    api.get<{ data: ProgramInfo }>(`/programs/${programId}`).then((r) => r.data.data),

  create: (body: { name: string; slug?: string; branding?: Record<string, unknown> }) =>
    api.post<{ data: ProgramInfo }>("/programs", body).then((r) => r.data.data),

  listMembers: (programId: string) =>
    api.get(`/programs/${programId}/members`).then((r) => r.data.data),

  listInvites: (programId: string) =>
    api.get(`/programs/${programId}/invites`).then((r) => r.data.data),

  inviteOrg: (
    programId: string,
    body: { organizationId?: string; orgSlug?: string; email?: string; roleInProgram?: string },
  ) => api.post(`/programs/${programId}/invite-org`, body).then((r) => r.data.data),

  acceptInvite: (token: string) =>
    api.post("/programs/accept-invite", { token }).then((r) => r.data.data),
};
