import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workOrderApi } from "@/lib/api/work-orders";
import { WorkOrder } from "@/types";

interface WorkOrderFilters {
  status?: string;
  afeId?: string;
  page?: number;
  pageSize?: number;
}

export function useWorkOrders(filters?: WorkOrderFilters) {
  return useQuery<WorkOrder[]>({
    queryKey: ["work-orders", filters],
    queryFn: () => workOrderApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function useWorkOrder(id: string) {
  return useQuery<WorkOrder>({
    queryKey: ["work-orders", id],
    queryFn: () => workOrderApi.findById(id),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => workOrderApi.create(dto),
    meta: { successMessage: "Work order created", errorMessage: "Could not create work order" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useIssueWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => workOrderApi.issue(id, comment),
    meta: { successMessage: "Work order issued", errorMessage: "Could not issue work order" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useStartWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workOrderApi.start(id),
    meta: { successMessage: "Work order started", errorMessage: "Could not start work order" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useCompleteWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workOrderApi.complete(id),
    meta: { successMessage: "Work order completed", errorMessage: "Could not complete work order" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useCloseWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => workOrderApi.close(id, comment),
    meta: { successMessage: "Work order closed", errorMessage: "Could not close work order" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}
