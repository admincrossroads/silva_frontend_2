"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import type { Schedule3Threshold } from "@/types";

export function useSchedule3() {
  return useQuery<Schedule3Threshold[]>({
    queryKey: ["schedule3"],
    queryFn: () => platformApi.listSchedule3(),
  });
}

export function usePatchSchedule3Band() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      band,
      ...dto
    }: {
      band: string;
      minValueUsd?: number;
      maxValueUsd?: number | null;
      spxAuthority?: string;
      silvaAuthority?: string;
      effectiveYear?: number;
    }) => platformApi.patchSchedule3(band, dto),
    meta: { successMessage: "Schedule 3 band updated", errorMessage: "Could not update band" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule3"] }),
  });
}
