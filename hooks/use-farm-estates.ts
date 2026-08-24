"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { farmEstatesApi } from "@/lib/api/farm-estates";

export function useFarmEstates(params?: {
  status?: string;
  forVendorId?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryParams } = params ?? {};
  return useQuery({
    queryKey: ["farm-estates", queryParams],
    queryFn: () => farmEstatesApi.list(queryParams),
    enabled,
  });
}

export function useFarmEstate(id: string) {
  return useQuery({
    queryKey: ["farm-estates", id],
    queryFn: () => farmEstatesApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateFarmEstate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: farmEstatesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm-estates"] }),
  });
}

export function useUpdateFarmEstate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Parameters<typeof farmEstatesApi.update>[1] & { id: string }) =>
      farmEstatesApi.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["farm-estates"] });
      qc.invalidateQueries({ queryKey: ["farm-estates", id] });
    },
  });
}

export function useSetFarmEstateVendors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vendorIds }: { id: string; vendorIds: string[] }) =>
      farmEstatesApi.setVendors(id, vendorIds),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["farm-estates"] });
      qc.invalidateQueries({ queryKey: ["farm-estates", id] });
    },
  });
}

export function useAddFarmEstateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      estateId,
      ...dto
    }: { estateId: string; code: string; label?: string; areaHa?: number; treeCount?: number }) =>
      farmEstatesApi.addBlock(estateId, dto),
    onSuccess: (_, { estateId }) => {
      qc.invalidateQueries({ queryKey: ["farm-estates"] });
      qc.invalidateQueries({ queryKey: ["farm-estates", estateId] });
    },
  });
}

export function useRemoveFarmEstateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ estateId, blockId }: { estateId: string; blockId: string }) =>
      farmEstatesApi.removeBlock(estateId, blockId),
    onSuccess: (_, { estateId }) => {
      qc.invalidateQueries({ queryKey: ["farm-estates"] });
      qc.invalidateQueries({ queryKey: ["farm-estates", estateId] });
    },
  });
}
