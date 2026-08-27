"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import type { AuthMe } from "@/types";

function getPersistApi() {
  return useAuthStore.persist;
}

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
  // Always start false on server + first client paint so SSR never touches persist.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = getPersistApi();
    if (!persistApi) {
      setHydrated(true);
      return;
    }

    setHydrated(persistApi.hasHydrated());
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !accessToken) return;
    // Session already restored from storage or set at login — skip blocking /me
    if (user && permissions.length > 0 && tenant) return;

    let cancelled = false;
    authApi
      .me()
      .then((data: AuthMe) => {
        if (cancelled) return;
        setSession(data.user, data.permissions, {
          tenant: data.tenant,
          activeProgram: data.activeProgram,
          programs: data.programs,
        });
      })
      .catch(() => {
        if (cancelled) return;
        logout();
        router.push("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, accessToken, user, permissions.length, tenant, setSession, logout, router]);

  const loading =
    !hydrated || (!!accessToken && (!user || permissions.length === 0 || !tenant));

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
