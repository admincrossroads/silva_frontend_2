"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import type { AuthMe } from "@/types";

export function useAuth() {
  const {
    user,
    accessToken,
    permissions,
    tenant,
    activeProgram,
    programs,
    setSession,
    setTokens,
    logout,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;
    if (user && permissions.length > 0 && tenant) return;

    authApi
      .me()
      .then((data: AuthMe) => {
        setSession(data.user, data.permissions, {
          tenant: data.tenant,
          activeProgram: data.activeProgram,
          programs: data.programs,
        });
      })
      .catch(() => {
        logout();
        router.push("/login");
      });
  }, [accessToken, user, permissions.length, tenant, setSession, logout, router]);

  const loading = !!accessToken && (!user || permissions.length === 0);

  return {
    user,
    permissions,
    tenant,
    activeProgram,
    programs,
    isAuthenticated: !!accessToken,
    loading,
    logout: () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        void authApi.logout(refreshToken).catch(() => undefined);
      }
      logout();
      router.push("/login");
    },
    refreshSession: async () => {
      const data = await authApi.me();
      setSession(data.user, data.permissions, {
        tenant: data.tenant,
        activeProgram: data.activeProgram,
        programs: data.programs,
      });
    },
    switchProgram: async (programId: string) => {
      const data = await authApi.switchProgram(programId);
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      if (data.me) {
        setSession(data.me.user, data.me.permissions, {
          tenant: data.me.tenant,
          activeProgram: data.me.activeProgram,
          programs: data.me.programs,
        });
      } else {
        const me = await authApi.me();
        setSession(me.user, me.permissions, {
          tenant: me.tenant,
          activeProgram: me.activeProgram,
          programs: me.programs,
        });
      }
    },
  };
}
