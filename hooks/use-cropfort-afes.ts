import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cropfortAfesApi,
  type CreateCropfortAfeDto,
  type CropfortAfe,
} from "@/lib/api/cropfort/afes";

export function useCropfortAfes(params?: { status?: string; band?: string }) {
  return useQuery<CropfortAfe[]>({
    queryKey: ["cropfort-afes", params],
    queryFn: () => cropfortAfesApi.list(params),
  });
}

export function useCropfortAfeBandPreview(amountEtb?: number) {
  return useQuery({
    queryKey: ["cropfort-afe-band", amountEtb],
    queryFn: () => cropfortAfesApi.previewBand(amountEtb!),
    enabled: amountEtb != null && amountEtb > 0,
  });
}

export function useCreateCropfortAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCropfortAfeDto) => cropfortAfesApi.create(dto),
    meta: { successMessage: "AFE created", errorMessage: "Could not create AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afes"] }),
  });
}

export function useSubmitCropfortAfes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (afeIds: string[]) => cropfortAfesApi.submit(afeIds),
    meta: { successMessage: "AFE(s) submitted", errorMessage: "Could not submit AFE(s)" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afes"] }),
  });
}

export function useApproveCropfortAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ afeId, comment }: { afeId: string; comment?: string }) =>
      cropfortAfesApi.approve(afeId, comment),
    meta: { successMessage: "AFE approved", errorMessage: "Could not approve AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afes"] }),
  });
}

export function useReturnCropfortAfe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ afeId, comment }: { afeId: string; comment: string }) =>
      cropfortAfesApi.returnAfe(afeId, comment),
    meta: { successMessage: "AFE returned", errorMessage: "Could not return AFE" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afes"] }),
  });
}
