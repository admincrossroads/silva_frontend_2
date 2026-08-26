import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityRequestApi, type ActivityRequest } from "@/lib/api/activity-requests";

export function useActivityRequests(filters?: Record<string, unknown>) {
  return useQuery<ActivityRequest[]>({
    queryKey: ["activity-requests", filters],
    queryFn: () => activityRequestApi.findAll(filters),
  });
}

export function useActivityRequest(id: string) {
  return useQuery({
    queryKey: ["activity-requests", id],
    queryFn: () => activityRequestApi.findById(id),
    enabled: Boolean(id),
  });
}

export function useWorkListOptions() {
  return useQuery({
    queryKey: ["activity-requests", "work-list-options"],
    queryFn: () => activityRequestApi.workListOptions(),
  });
}

export function useCreateActivityRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => activityRequestApi.create(dto),
    meta: { successMessage: "Request submitted", errorMessage: "Could not submit request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity-requests"] }),
  });
}

export function useConvertActivityRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      activityRequestApi.convert(id, body),
    meta: { successMessage: "Converted to AFE", errorMessage: "Could not convert request" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activity-requests"] });
      qc.invalidateQueries({ queryKey: ["afes"] });
    },
  });
}

export function useDismissActivityRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => activityRequestApi.dismiss(id, reason),
    meta: { successMessage: "Request dismissed", errorMessage: "Could not dismiss request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity-requests"] }),
  });
}
