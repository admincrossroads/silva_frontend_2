import { useQuery } from "@tanstack/react-query";
import { cropfortDashboardApi } from "@/lib/api/cropfort/dashboard";

export function useCropfortDashboard(params?: { planYear?: number; blockId?: string }) {
  return useQuery({
    queryKey: ["cropfort-dashboard", params],
    queryFn: () => cropfortDashboardApi.get(params),
  });
}
