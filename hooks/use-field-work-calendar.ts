import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  feeScheduleApi,
  fieldWorkCalendarApi,
  type FeeScheduleUpsert,
  type FieldWorkCalendarUpsert,
} from "@/lib/api/cropfort/field-work-calendar";

export function useFieldWorkCalendar(farmId: string | undefined) {
  return useQuery({
    queryKey: ["field-work-calendar", farmId],
    queryFn: () => fieldWorkCalendarApi.get(farmId!),
    enabled: Boolean(farmId),
  });
}

export function useSeedFieldWorkCalendar(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fieldWorkCalendarApi.seed(farmId),
    meta: {
      successMessage: "Calendar seeded from templates",
      errorMessage: "Could not seed calendar",
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-work-calendar", farmId] }),
  });
}

export function useUpsertFieldWorkCalendar(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FieldWorkCalendarUpsert) => fieldWorkCalendarApi.upsert(farmId, body),
    meta: { successMessage: "Calendar saved", errorMessage: "Could not save calendar" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-work-calendar", farmId] }),
  });
}

export function useSubmitFieldWorkCalendar(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fieldWorkCalendarApi.submit(farmId),
    meta: { successMessage: "Calendar submitted", errorMessage: "Could not submit calendar" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-work-calendar", farmId] }),
  });
}

export function useApproveFieldWorkCalendar(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fieldWorkCalendarApi.approve(farmId),
    meta: { successMessage: "Calendar approved", errorMessage: "Could not approve calendar" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-work-calendar", farmId] }),
  });
}

export function useFeeSchedule(farmId: string | undefined) {
  return useQuery({
    queryKey: ["fee-schedule", farmId],
    queryFn: () => feeScheduleApi.get(farmId!),
    enabled: Boolean(farmId),
  });
}

export function useUpsertFeeSchedule(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FeeScheduleUpsert) => feeScheduleApi.upsert(farmId, body),
    meta: { successMessage: "Fee schedule saved", errorMessage: "Could not save fee schedule" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fee-schedule", farmId] }),
  });
}

export function useSubmitFeeSchedule(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => feeScheduleApi.submit(farmId),
    meta: { successMessage: "Fee schedule submitted", errorMessage: "Could not submit" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fee-schedule", farmId] }),
  });
}

export function useApproveFeeSchedule(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => feeScheduleApi.approve(farmId),
    meta: { successMessage: "Fee schedule approved", errorMessage: "Could not approve" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fee-schedule", farmId] }),
  });
}
