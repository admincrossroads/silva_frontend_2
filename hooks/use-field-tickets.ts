import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fieldTicketApi } from "@/lib/api/field-tickets";
import { FieldTicket } from "@/types";

interface FieldTicketFilters {
  status?: string;
  workOrderId?: string;
  page?: number;
  pageSize?: number;
}

export function useFieldTickets(filters?: FieldTicketFilters) {
  return useQuery<FieldTicket[]>({
    queryKey: ["field-tickets", filters],
    queryFn: () => fieldTicketApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function useFieldTicket(id: string) {
  return useQuery<FieldTicket>({
    queryKey: ["field-tickets", id],
    queryFn: () => fieldTicketApi.findById(id),
    enabled: !!id,
  });
}

export function useCreateFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => fieldTicketApi.create(dto),
    meta: { successMessage: "Field ticket created", errorMessage: "Could not create field ticket" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-tickets"] }),
  });
}

export function useSubmitFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fieldTicketApi.submit(id),
    meta: { successMessage: "Field ticket submitted", errorMessage: "Could not submit field ticket" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-tickets"] }),
  });
}

export function useVendorReviewFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fieldTicketApi.vendorReview(id),
    meta: { successMessage: "Vendor review complete", errorMessage: "Could not complete vendor review" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-tickets"] }),
  });
}

export function useValidateFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      fieldTicketApi.validate(id, comment),
    meta: { successMessage: "Field ticket validated", errorMessage: "Could not validate field ticket" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-tickets"] }),
  });
}

export function useRejectFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      fieldTicketApi.reject(id, reason),
    meta: { successMessage: "Field ticket rejected", errorMessage: "Could not reject field ticket" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["field-tickets"] }),
  });
}
