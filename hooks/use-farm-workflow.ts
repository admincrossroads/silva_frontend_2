import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { farmPlatformApi } from "@/lib/api/cropfort/farm-platform";

export function useFarmWorkflow(farmId: string | undefined) {
  return useQuery({
    queryKey: ["farm-workflow", farmId],
    queryFn: () => farmPlatformApi.getWorkflow(farmId!),
    enabled: Boolean(farmId),
  });
}

export function useCompleteFarmStage(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stageKey: string) => farmPlatformApi.completeStage(farmId, stageKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm-workflow", farmId] }),
  });
}

export function useFarmBenchmarkSurveys(farmId: string | undefined) {
  return useQuery({
    queryKey: ["farm-benchmarks", farmId],
    queryFn: () => farmPlatformApi.listBenchmarkSurveys(farmId!),
    enabled: Boolean(farmId),
  });
}

export function useFarmElections(farmId: string | undefined, planYear = 2026) {
  return useQuery({
    queryKey: ["farm-elections", farmId, planYear],
    queryFn: () => farmPlatformApi.listElections(farmId!, { planYear }),
    enabled: Boolean(farmId),
  });
}

export function useFarmActivityPlans(farmId: string | undefined, planYear = 2026) {
  return useQuery({
    queryKey: ["farm-activity-plans", farmId, planYear],
    queryFn: () => farmPlatformApi.listActivityPlans(farmId!, planYear),
    enabled: Boolean(farmId),
  });
}

export function useFarmBudgetRollup(farmId: string | undefined, planYear = 2026) {
  return useQuery({
    queryKey: ["farm-budget-rollup", farmId, planYear],
    queryFn: () => farmPlatformApi.getBudgetRollup(farmId!, planYear),
    enabled: Boolean(farmId),
  });
}
