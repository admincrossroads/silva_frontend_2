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
    meta: { successMessage: "Work plan created", errorMessage: "Could not create work plan" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-plans"] }),
  });
}

export function useSubmitWorkPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workPlansApi.submit,
    meta: {
      successMessage: "Work plan submitted",
      successDescription: "SPX will review and accept or request changes.",
      errorMessage: "Could not submit work plan",
    },
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
    meta: {
      successMessage: "Work plan accepted",
      successDescription: "Promoted to AFP lines and activity catalog.",
      errorMessage: "Could not accept work plan",
    },
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
    meta: { successMessage: "Work plan rejected", errorMessage: "Could not reject work plan" },
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
    meta: { successMessage: "Plan details saved", errorMessage: "Could not save plan details" },
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
    meta: { successMessage: "Plan draft saved", errorMessage: "Could not save plan draft" },
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
    meta: {
      successMessage: "Excel uploaded",
      successDescription: "Activities imported into the work plan.",
      errorMessage: "Could not upload Excel file",
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["work-plans", id] });
    },
  });
}
