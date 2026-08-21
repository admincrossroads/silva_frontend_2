import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentRequestApi } from "@/lib/api/payment-requests";
import { PaymentRequest } from "@/types";

interface PaymentRequestFilters {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export function usePaymentRequests(filters?: PaymentRequestFilters) {
  return useQuery<PaymentRequest[]>({
    queryKey: ["payment-requests", filters],
    queryFn: () => paymentRequestApi.findAll(filters as Record<string, unknown> | undefined),
  });
}

export function usePaymentRequest(id: string) {
  return useQuery<PaymentRequest>({
    queryKey: ["payment-requests", id],
    queryFn: () => paymentRequestApi.findById(id),
    enabled: !!id,
  });
}

export function useCreatePaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) => paymentRequestApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}

export function useSubmitPaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentRequestApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}

export function useVerifyPaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentRequestApi.verify(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}

export function useRejectPaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      paymentRequestApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}
