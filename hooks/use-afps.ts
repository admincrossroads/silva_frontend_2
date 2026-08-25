import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { afpApi } from "@/lib/api/afp";
import { Afp } from "@/types";

interface AfpFilters {
  year?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useAfps(filters?: AfpFilters) {
  return useQuery<Afp[]>({
    queryKey: ["afps", filters],
    queryFn: () => afpApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function useAfp(id: string) {
  return useQuery<Afp>({
    queryKey: ["afps", id],
    queryFn: () => afpApi.findById(id),
    enabled: !!id,
  });
}

export function useCreateAfp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => afpApi.create(dto),
    meta: { successMessage: "AFP line created", errorMessage: "Could not create AFP line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afps"] }),
  });
}

export function useSubmitAfp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => afpApi.submit(id, comment),
    meta: { successMessage: "AFP submitted", errorMessage: "Could not submit AFP" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afps"] }),
  });
}

export function useApproveAfp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => afpApi.approve(id, comment),
    meta: { successMessage: "AFP approved", errorMessage: "Could not approve AFP" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["afps"] }),
  });
}
