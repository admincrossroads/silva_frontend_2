import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  rateCardApi,
  type CreateRateCardLineDto,
  type LaborRateCard,
  type RateCardLine,
  type RateCardMeta,
} from "@/lib/api/cropfort/rate-card";

export function useRateCardLines(status?: string) {
  return useQuery<RateCardLine[]>({
    queryKey: ["cropfort-rate-card", status ?? "all"],
    queryFn: () => rateCardApi.list(status ? { status } : undefined),
  });
}

export function useRateCardMeta() {
  return useQuery<RateCardMeta>({
    queryKey: ["cropfort-rate-card-meta"],
    queryFn: () => rateCardApi.meta(),
  });
}

export function useLaborRateCards(farmEstateId?: string) {
  return useQuery<LaborRateCard[]>({
    queryKey: ["cropfort-labor-rate-cards", farmEstateId ?? "all"],
    queryFn: () => rateCardApi.listLabor(farmEstateId ? { farmEstateId } : undefined),
  });
}

export function useCreateRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRateCardLineDto) => rateCardApi.create(dto),
    meta: { successMessage: "Rate line created", errorMessage: "Could not create rate line" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] });
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card-meta"] });
    },
  });
}

export function useUpdateRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, dto }: { lineId: string; dto: Partial<CreateRateCardLineDto> }) =>
      rateCardApi.update(lineId, dto),
    meta: { successMessage: "Rate line updated", errorMessage: "Could not update rate line" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] });
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card-meta"] });
    },
  });
}

export function useSubmitRateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineIds: string[]) => rateCardApi.submit(lineIds),
    meta: { successMessage: "Rate card submitted", errorMessage: "Could not submit rate card" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] });
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card-meta"] });
    },
  });
}

export function useApproveRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, comment }: { lineId: string; comment?: string }) =>
      rateCardApi.approveLine(lineId, comment),
    meta: { successMessage: "Line approved", errorMessage: "Could not approve line" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] });
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card-meta"] });
    },
  });
}

export function useReturnRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, comment }: { lineId: string; comment: string }) =>
      rateCardApi.returnLine(lineId, comment),
    meta: { successMessage: "Line returned", errorMessage: "Could not return line" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] });
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card-meta"] });
    },
  });
}

export function useReopenRateCardLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineId: string) => rateCardApi.reopenLine(lineId),
    meta: { successMessage: "Line reopened as draft", errorMessage: "Could not reopen line" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card"] });
      qc.invalidateQueries({ queryKey: ["cropfort-rate-card-meta"] });
    },
  });
}
