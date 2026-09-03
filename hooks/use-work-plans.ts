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
      successDescription: "Plan marked submitted. Promote when ready to create Annual plan drafts.",
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
      successMessage: "Draft Annual plan created",
      successDescription: "Elect lines on Annual plan, then submit for Silva approval.",
      errorMessage: "Could not promote work plan",
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-plans"] });
      qc.invalidateQueries({ queryKey: ["cropfort-afp-blocks"] });
      qc.invalidateQueries({ queryKey: ["afps"] });
      qc.invalidateQueries({ queryKey: ["activity-master"] });
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
    mutationFn: ({ id, file, sectionCode }: { id: string; file: File; sectionCode: string }) =>
      workPlansApi.uploadExcel(id, file, sectionCode),
    meta: {
      successMessage: "Excel uploaded",
      successDescription: "Activities imported into the selected operation.",
      errorMessage: "Could not upload Excel file",
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["work-plans", id] });
    },
  });
}
