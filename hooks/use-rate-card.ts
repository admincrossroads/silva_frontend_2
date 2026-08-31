import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  rateCardApi,
  type CreateRateCardLineDto,
  type RateCardLine,
} from "@/lib/api/cropfort/rate-card";

export function useRateCardLines(status?: string) {
  return useQuery<RateCardLine[]>({
    queryKey: ["cropfort-rate-card", status],
    queryFn: () => rateCardApi.list(status ? { status } : undefined),
  });
}

export function useCreateRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRateCardLineDto) => rateCardApi.create(dto),
    meta: { successMessage: "Rate line created", errorMessage: "Could not create rate line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] }),
  });
}

export function useUpdateRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, dto }: { lineId: string; dto: Partial<CreateRateCardLineDto> }) =>
      rateCardApi.update(lineId, dto),
    meta: { successMessage: "Rate line updated", errorMessage: "Could not update rate line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] }),
  });
}

export function useSubmitRateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineIds: string[]) => rateCardApi.submit(lineIds),
    meta: { successMessage: "Rate card submitted", errorMessage: "Could not submit rate card" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] }),
  });
}

export function useApproveRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, comment }: { lineId: string; comment?: string }) =>
      rateCardApi.approveLine(lineId, comment),
    meta: { successMessage: "Line approved", errorMessage: "Could not approve line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] }),
  });
}

export function useReturnRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, comment }: { lineId: string; comment: string }) =>
      rateCardApi.returnLine(lineId, comment),
    meta: { successMessage: "Line returned", errorMessage: "Could not return line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] }),
  });
}
