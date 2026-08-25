import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactApi, type ContactSubmitDto } from "@/lib/api/contact";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (dto: ContactSubmitDto) => contactApi.submit(dto),
    meta: {
      successMessage: "Message sent",
      successDescription: "We'll get back to you soon.",
      errorMessage: "Could not send message",
    },
  });
}

export function useContactSubmissions(params?: { status?: string; q?: string }) {
  return useQuery({
    queryKey: ["contact-submissions", params],
    queryFn: () => contactApi.list(params),
  });
}

export function useMarkContactRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactApi.markRead(id),
    meta: { successMessage: "Marked as read", errorMessage: "Could not update message" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });
}
