"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { registrationApi } from "@/lib/api/registration";

export function useSubmitRegistration() {
  return useMutation({
    mutationFn: registrationApi.submit,
    meta: {
      successMessage: "Registration created",
      successDescription: "Workspace provisioned and activation invitation sent.",
      errorMessage: "Could not create registration",
    },
  });
}

export function useRegistrationRequests(params?: { lifecycle?: string; orgType?: string; q?: string }) {
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
    meta: { successMessage: "Invitation sent", errorMessage: "Could not provision registration" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-requests"] }),
  });
}

export function useCancelRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => registrationApi.cancel(id, notes),
    meta: { successMessage: "Registration cancelled", errorMessage: "Could not cancel registration" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-requests"] }),
  });
}

export function useResendRegistrationActivation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => registrationApi.resendActivation(id),
    meta: { successMessage: "Invitation sent", errorMessage: "Could not send invitation" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-requests"] }),
  });
}

export function useActivateAccount() {
  return useMutation({
    mutationFn: registrationApi.activate,
    meta: { successMessage: "Account activated", errorMessage: "Could not activate account" },
  });
}
