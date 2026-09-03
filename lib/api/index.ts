import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { shouldScopeRequest } from "@/lib/api/farm-estate-scope";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5078/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (typeof window !== "undefined") {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
    config.headers["X-App-Base-Url"] = appUrl;
  }

  if (config.method?.toLowerCase() === "get" && shouldScopeRequest(config.url)) {
    const farmEstateId = useWorkspaceStore.getState().activeFarmEstateId;
    if (farmEstateId) {
      config.params = { ...(config.params ?? {}), farmEstateId };
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const store = useAuthStore.getState();
      if (store.refreshToken) {
        try {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken: store.refreshToken }
          );
          store.setTokens(res.data.data.accessToken, res.data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(error.config);
        } catch {
          store.logout();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      } else {
        store.logout();
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
