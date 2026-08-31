import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activityMasterApi,
  type ActivityMaster,
  type CreateActivityMasterDto,
} from "@/lib/api/cropfort/activity-master";

export function useActivityTemplates() {
  return useQuery({
    queryKey: ["cropfort-activity-templates"],
    queryFn: () => activityMasterApi.listTemplates(),
  });
}

export function useActivityMaster() {
  return useQuery<ActivityMaster[]>({
    queryKey: ["cropfort-activity-master"],
    queryFn: () => activityMasterApi.list(),
  });
}

export function useCreateActivityMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateActivityMasterDto) => activityMasterApi.create(dto),
    meta: { successMessage: "Activity added", errorMessage: "Could not add activity" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-activity-master"] }),
  });
}

export function useUpdateActivityMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, dto }: { activityId: string; dto: Partial<CreateActivityMasterDto> }) =>
      activityMasterApi.update(activityId, dto),
    meta: { successMessage: "Activity updated", errorMessage: "Could not update activity" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-activity-master"] }),
  });
}
