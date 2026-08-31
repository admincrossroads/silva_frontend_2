import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adHocRequestsApi,
  type AdHocRequest,
  type CoreOperationKind,
  type CoreOperationStats,
} from "@/lib/api/ad-hoc-requests";

interface CoreOperationFilters {
  status?: string;
  urgency?: string;
  origin?: string;
  operationKind?: CoreOperationKind;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export function useAdHocRequests(filters?: CoreOperationFilters) {
  return useQuery<AdHocRequest[]>({
    queryKey: ["ad-hoc-requests", filters],
    queryFn: () => adHocRequestsApi.findAll(filters),
  });
}

export function useCoreOperationStats() {
  return useQuery<CoreOperationStats>({
    queryKey: ["core-operation-stats"],
    queryFn: () => adHocRequestsApi.stats(),
  });
}

export function useAdHocRequest(id: string) {
  return useQuery<AdHocRequest>({
    queryKey: ["ad-hoc-requests", id],
    queryFn: () => adHocRequestsApi.findById(id),
    enabled: !!id,
  });
}

export function useCreateAdHocRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => adHocRequestsApi.create(dto),
    meta: { successMessage: "Core operation submitted", errorMessage: "Could not create request" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-hoc-requests"] });
      qc.invalidateQueries({ queryKey: ["core-operation-stats"] });
    },
  });
}

export function useSubmitAdHocRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adHocRequestsApi.submit(id),
    meta: { successMessage: "Request submitted to SPX", errorMessage: "Could not submit request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ad-hoc-requests"] }),
  });
}

export function useDismissAdHocRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => adHocRequestsApi.dismiss(id, notes),
    meta: { successMessage: "Request dismissed", errorMessage: "Could not dismiss request" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-hoc-requests"] });
      qc.invalidateQueries({ queryKey: ["core-operation-stats"] });
    },
  });
}

export function useConvertAdHocRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Record<string, unknown> }) =>
      adHocRequestsApi.convert(id, dto),
    meta: { successMessage: "Converted to AFE", errorMessage: "Could not convert request" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-hoc-requests"] });
      qc.invalidateQueries({ queryKey: ["afes"] });
    },
  });
}

export function useConvertCoreOperationToCropfort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: { title?: string; amountEtb?: number; notes?: string };
    }) => adHocRequestsApi.convertCropfort(id, dto),
    meta: { successMessage: "Converted to Cropfort AFE", errorMessage: "Could not convert request" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad-hoc-requests"] });
      qc.invalidateQueries({ queryKey: ["cropfort-afes"] });
      qc.invalidateQueries({ queryKey: ["core-operation-stats"] });
    },
  });
}
