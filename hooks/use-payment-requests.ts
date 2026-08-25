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
    meta: { successMessage: "Payment request created", errorMessage: "Could not create payment request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}

export function useSubmitPaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentRequestApi.submit(id),
    meta: { successMessage: "Payment request submitted", errorMessage: "Could not submit payment request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}

export function useVerifyPaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentRequestApi.verify(id),
    meta: { successMessage: "Payment request verified", errorMessage: "Could not verify payment request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}

export function useRejectPaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      paymentRequestApi.reject(id, reason),
    meta: { successMessage: "Payment request rejected", errorMessage: "Could not reject payment request" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });
}
