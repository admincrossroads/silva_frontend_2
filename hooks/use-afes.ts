import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { afeApi } from "@/lib/api/afe";
import { Afe } from "@/types";

interface AfeFilters {
  status?: string;
  band?: string;
  page?: number;
  pageSize?: number;
}

export function useAfes(filters?: AfeFilters) {
  return useQuery<Afe[]>({
    queryKey: ["afes", filters],
    queryFn: () => afeApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function useAfe(id: string) {
  return useQuery<Afe>({
    queryKey: ["afes", id],
    queryFn: () => afeApi.findById(id),
    enabled: !!id,
  });
}

export function useAfeHistory(id: string) {
  return useQuery({
    queryKey: ["afes", id, "history"],
    queryFn: () => afeApi.history(id),
    enabled: !!id,
  });
}

export function useCreateAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => afeApi.create(dto),
    meta: { successMessage: "AFE created", errorMessage: "Could not create AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afes"] }),
  });
}

export function useSubmitAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => afeApi.submit(id, comment),
    meta: { successMessage: "AFE submitted", errorMessage: "Could not submit AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afes"] }),
  });
}

export function useValidateAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => afeApi.validate(id, comment),
    meta: { successMessage: "AFE validated", errorMessage: "Could not validate AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afes"] }),
  });
}

export function useApproveAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => afeApi.approve(id, comment),
    meta: { successMessage: "AFE approved", errorMessage: "Could not approve AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afes"] }),
  });
}

export function useRejectAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => afeApi.reject(id, reason),
    meta: { successMessage: "AFE rejected", errorMessage: "Could not reject AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afes"] }),
  });
}
