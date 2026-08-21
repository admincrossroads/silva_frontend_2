import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProgramInfo, TenantInfo, User } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  permissions: string[];
  tenant: TenantInfo | null;
  activeProgram: ProgramInfo | null;
  programs: ProgramInfo[];
  setTokens: (access: string, refresh: string) => void;
  setSession: (
    user: User,
    permissions: string[],
    extras?: { tenant?: TenantInfo | null; activeProgram?: ProgramInfo | null; programs?: ProgramInfo[] },
  ) => void;
  setUser: (user: User) => void;
  setTenantContext: (payload: {
    tenant?: TenantInfo | null;
    activeProgram?: ProgramInfo | null;
    programs?: ProgramInfo[];
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      permissions: [],
      tenant: null,
      activeProgram: null,
      programs: [],
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setSession: (user, permissions, extras) =>
        set({
          user,
          permissions,
          tenant: extras?.tenant ?? null,
          activeProgram: extras?.activeProgram ?? null,
          programs: extras?.programs ?? [],
        }),
      setUser: (user) => set({ user }),
      setTenantContext: (payload) =>
        set((state) => ({
          tenant: payload.tenant !== undefined ? payload.tenant : state.tenant,
          activeProgram: payload.activeProgram !== undefined ? payload.activeProgram : state.activeProgram,
          programs: payload.programs !== undefined ? payload.programs : state.programs,
        })),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          permissions: [],
          tenant: null,
          activeProgram: null,
          programs: [],
        }),
    }),
    {
      name: "coffee-field-os-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
