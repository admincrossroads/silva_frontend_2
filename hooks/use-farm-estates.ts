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
    meta: { successMessage: "Farm estate created", errorMessage: "Could not create farm estate" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farm-estates"] }),
  });
}

export function useUpdateFarmEstate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Parameters<typeof farmEstatesApi.update>[1] & { id: string }) =>
      farmEstatesApi.update(id, dto),
    meta: { successMessage: "Farm estate updated", errorMessage: "Could not update farm estate" },
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
    meta: { successMessage: "Vendors updated", errorMessage: "Could not update vendors" },
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
    meta: { successMessage: "Block added", errorMessage: "Could not add block" },
    onSuccess: (_, { estateId }) => {
      qc.invalidateQueries({ queryKey: ["farm-estates"] });
      qc.invalidateQueries({ queryKey: ["farm-estates", estateId] });
    },
  });
}

export function useUpdateFarmEstateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      estateId,
      blockId,
      ...dto
    }: { estateId: string; blockId: string } & Parameters<typeof farmEstatesApi.updateBlock>[2]) =>
      farmEstatesApi.updateBlock(estateId, blockId, dto),
    meta: { successMessage: "Block updated", errorMessage: "Could not update block" },
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
    meta: { successMessage: "Block removed", errorMessage: "Could not remove block" },
    onSuccess: (_, { estateId }) => {
      qc.invalidateQueries({ queryKey: ["farm-estates"] });
      qc.invalidateQueries({ queryKey: ["farm-estates", estateId] });
    },
  });
}
