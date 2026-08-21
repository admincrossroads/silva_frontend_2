import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settlementApi } from "@/lib/api/settlements";
import { Settlement } from "@/types";

interface SettlementFilters {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export function useSettlements(filters?: SettlementFilters) {
  return useQuery<Settlement[]>({
    queryKey: ["settlements", filters],
    queryFn: () => settlementApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function useSettlement(id: string) {
  return useQuery<Settlement>({
    queryKey: ["settlements", id],
    queryFn: () => settlementApi.findById(id),
    enabled: !!id,
  });
}

export function useCreateSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => settlementApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settlements"] }),
  });
}

export function useAuthorizeSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settlementApi.authorize(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settlements"] }),
  });
}

export function useMarkSettled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settlementApi.markSettled(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settlements"] }),
  });
}
