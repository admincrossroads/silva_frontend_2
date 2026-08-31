import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  blockFieldTicketsApi,
  type BlockFieldTicket,
  type CreateBlockFieldTicketDto,
} from "@/lib/api/cropfort/block-field-tickets";

export function useBlockFieldTickets(params?: { weekEnding?: string; blockId?: string; status?: string }) {
  return useQuery<BlockFieldTicket[]>({
    queryKey: ["cropfort-block-tickets", params],
    queryFn: () => blockFieldTicketsApi.list(params),
  });
}

export function useCreateBlockFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBlockFieldTicketDto) => blockFieldTicketsApi.create(dto),
    meta: { successMessage: "Ticket saved", errorMessage: "Could not save ticket" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-block-tickets"] }),
  });
}

export function useSubmitBlockFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => blockFieldTicketsApi.submit(ticketId),
    meta: { successMessage: "Ticket submitted", errorMessage: "Could not submit ticket" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-block-tickets"] }),
  });
}

export function useReviewBlockFieldTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      spxNote,
    }: {
      ticketId: string;
      status: "reviewed_approved" | "reviewed_flagged" | "reviewed_returned";
      spxNote?: string;
    }) => blockFieldTicketsApi.review(ticketId, { status, spxNote }),
    meta: { successMessage: "Review recorded", errorMessage: "Could not record review" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-block-tickets"] }),
  });
}
