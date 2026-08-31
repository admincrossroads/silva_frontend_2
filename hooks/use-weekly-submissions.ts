import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { weeklySubmissionsApi } from "@/lib/api/cropfort/weekly-submissions";

export function useValidationQueue() {
  return useQuery({
    queryKey: ["cropfort-validation-queue"],
    queryFn: () => weeklySubmissionsApi.getQueue(),
  });
}

export function useWeeklySubmission(weekEnding?: string) {
  return useQuery({
    queryKey: ["cropfort-weekly-submission", weekEnding],
    queryFn: () => weeklySubmissionsApi.getByWeek(weekEnding!),
    enabled: Boolean(weekEnding),
  });
}

export function useSubmitWeeklySubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ weekEnding, ticketIds }: { weekEnding: string; ticketIds: string[] }) =>
      weeklySubmissionsApi.submitWeek(weekEnding, ticketIds),
    meta: { successMessage: "Week submitted", errorMessage: "Could not submit week" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-validation-queue"] });
      qc.invalidateQueries({ queryKey: ["cropfort-weekly-submission"] });
    },
  });
}

export function useValidateWeeklySubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weekEnding: string) => weeklySubmissionsApi.validateWeek(weekEnding),
    meta: { successMessage: "Validation complete", errorMessage: "Could not run validation" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-validation-queue"] });
      qc.invalidateQueries({ queryKey: ["cropfort-weekly-submission"] });
    },
  });
}

export function useReleaseWeeklySubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weekEnding: string) => weeklySubmissionsApi.releaseWeek(weekEnding),
    meta: { successMessage: "Week released", errorMessage: "Could not release week" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-validation-queue"] });
      qc.invalidateQueries({ queryKey: ["cropfort-weekly-submission"] });
      qc.invalidateQueries({ queryKey: ["cropfort-block-tickets"] });
    },
  });
}
