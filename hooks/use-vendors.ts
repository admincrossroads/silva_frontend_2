import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "@/lib/api/vendors";
import { Vendor } from "@/types";

interface VendorFilters {
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export function useVendors(filters?: VendorFilters) {
  return useQuery<Vendor[]>({
    queryKey: ["vendors", filters],
    queryFn: () => vendorApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function useVendor(id: string) {
  return useQuery<Vendor>({
    queryKey: ["vendors", id],
    queryFn: () => vendorApi.findById(id),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => vendorApi.create(dto),
    meta: { successMessage: "Vendor created", errorMessage: "Could not create vendor" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function usePatchVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Record<string, unknown> }) =>
      vendorApi.update(id, dto),
    meta: { successMessage: "Vendor updated", errorMessage: "Could not update vendor" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}
