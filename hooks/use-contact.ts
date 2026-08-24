import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactApi, type ContactSubmitDto } from "@/lib/api/contact";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (dto: ContactSubmitDto) => contactApi.submit(dto),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });
}
