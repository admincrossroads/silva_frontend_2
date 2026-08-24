"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workPlansApi } from "@/lib/api/work-plans";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useWorkPlans(params?: { status?: string }) {
  const activeFarmEstateId = useWorkspaceStore((s) => s.activeFarmEstateId);
  return useQuery({
    queryKey: ["work-plans", params, activeFarmEstateId],
    queryFn: () => workPlansApi.list(params),
  });
}

export function useWorkPlan(id: string) {
  return useQuery({
    queryKey: ["work-plans", id],
    queryFn: () => workPlansApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workPlansApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-plans"] }),
  });
}

export function useSubmitWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workPlansApi.submit,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["work-plans"] });
      qc.invalidateQueries({ queryKey: ["work-plans", id] });
    },
  });
}

export function useAcceptWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => workPlansApi.accept(id, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-plans"] });
      qc.invalidateQueries({ queryKey: ["afps"] });
      qc.invalidateQueries({ queryKey: ["activity-catalog"] });
    },
  });
}

export function useRejectWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => workPlansApi.reject(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-plans"] }),
  });
}

export function useWorkPlanTemplate() {
  return useQuery({
    queryKey: ["work-plans", "template"],
    queryFn: () => workPlansApi.template(),
    staleTime: 60_000,
  });
}

export function useUpdateWorkPlanMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...dto
    }: {
      id: string;
      farmEstateId?: string;
      totalAreaHa?: number | null;
      budgetYearLabel?: string;
      budgetYearGc?: number;
      fxEtbPerUsd?: number;
    }) => workPlansApi.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["work-plans"] });
      qc.invalidateQueries({ queryKey: ["work-plans", id] });
    },
  });
}

export function useUpdateWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parsedJson }: { id: string; parsedJson: Record<string, unknown> }) =>
      workPlansApi.updateParsed(id, parsedJson),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["work-plans"] });
      qc.invalidateQueries({ queryKey: ["work-plans", id] });
    },
  });
}

export function useUploadWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => workPlansApi.uploadExcel(id, file),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["work-plans", id] });
    },
  });
}
