"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { registrationApi } from "@/lib/api/registration";

export function useSubmitRegistration() {
  return useMutation({
    mutationFn: registrationApi.submit,
    meta: {
      successMessage: "Application submitted",
      successDescription: "SPX will review your request.",
      errorMessage: "Could not submit registration",
    },
  });
}

export function useRegistrationRequests(params?: { status?: string; orgType?: string; q?: string }) {
  return useQuery({
    queryKey: ["registration-requests", params],
    queryFn: () => registrationApi.list(params),
  });
}

export function useRegistrationRequest(id: string) {
  return useQuery({
    queryKey: ["registration-requests", id],
    queryFn: () => registrationApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => registrationApi.approve(id, notes),
    meta: { successMessage: "Registration approved", errorMessage: "Could not approve registration" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-requests"] }),
  });
}

export function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => registrationApi.reject(id, notes),
    meta: { successMessage: "Registration rejected", errorMessage: "Could not reject registration" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-requests"] }),
  });
}

export function useMarkRegistrationReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      registrationApi.markUnderReview(id, notes),
    meta: { successMessage: "Marked under review", errorMessage: "Could not update registration" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-requests"] }),
  });
}

export function useActivateAccount() {
  return useMutation({
    mutationFn: registrationApi.activate,
    meta: { successMessage: "Account activated", errorMessage: "Could not activate account" },
  });
}
