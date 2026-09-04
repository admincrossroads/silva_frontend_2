import { useQuery } from "@tanstack/react-query";
import { farmPlatformApi } from "@/lib/api/cropfort/farm-platform";
import { feeScheduleApi } from "@/lib/api/cropfort/field-work-calendar";

export function useFarmBudgetRollupTyped(farmId: string | undefined, planYear: number) {
  return useQuery({
    queryKey: ["farm-budget-rollup", farmId, planYear],
    queryFn: () => farmPlatformApi.getBudgetRollup(farmId!, planYear),
    enabled: Boolean(farmId),
  });
}

export function useFarmFeeSchedule(farmId: string | undefined) {
  return useQuery({
    queryKey: ["fee-schedule", farmId],
    queryFn: () => feeScheduleApi.get(farmId!),
    enabled: Boolean(farmId),
  });
}
