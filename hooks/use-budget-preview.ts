import { useQuery } from "@tanstack/react-query";
import { budgetApi } from "@/lib/api/cropfort/budget";

export function useBudgetPreview(params?: { planYear?: number; blockId?: string; budgetMonth?: string }) {
  return useQuery({
    queryKey: ["cropfort-budget", params],
    queryFn: () => budgetApi.preview(params),
  });
}
