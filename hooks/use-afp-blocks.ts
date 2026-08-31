import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  afpBlocksApi,
  type AfpBlockLine,
  type CreateAfpBlockLineDto,
  type ElectionStatus,
} from "@/lib/api/cropfort/afp-blocks";

export function useAfpBlockLines(params?: {
  planYear?: number;
  blockId?: string;
  status?: string;
  electionStatus?: string;
}) {
  return useQuery<AfpBlockLine[]>({
    queryKey: ["cropfort-afp-blocks", params],
    queryFn: () => afpBlocksApi.list(params),
  });
}

export function useCreateAfpBlockLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAfpBlockLineDto) => afpBlocksApi.create(dto),
    meta: { successMessage: "Block line created", errorMessage: "Could not create block line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afp-blocks"] }),
  });
}

export function useUpdateAfpBlockElection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, electionStatus }: { lineId: string; electionStatus: ElectionStatus }) =>
      afpBlocksApi.updateElection(lineId, electionStatus),
    meta: { successMessage: "Election updated", errorMessage: "Could not update election" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-afp-blocks"] });
      qc.invalidateQueries({ queryKey: ["cropfort-budget"] });
    },
  });
}

export function useSubmitAfpBlockLines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineIds: string[]) => afpBlocksApi.submit(lineIds),
    meta: { successMessage: "Lines submitted", errorMessage: "Could not submit lines" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afp-blocks"] }),
  });
}

export function useApproveAfpBlockLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, comment }: { lineId: string; comment?: string }) =>
      afpBlocksApi.approveLine(lineId, comment),
    meta: { successMessage: "Line approved", errorMessage: "Could not approve line" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-afp-blocks"] });
      qc.invalidateQueries({ queryKey: ["cropfort-budget"] });
    },
  });
}

export function useReturnAfpBlockLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, comment }: { lineId: string; comment: string }) =>
      afpBlocksApi.returnLine(lineId, comment),
    meta: { successMessage: "Line returned", errorMessage: "Could not return line" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-afp-blocks"] }),
  });
}
