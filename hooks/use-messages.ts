"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  messagesApi,
  type CreateThreadDto,
  type MessageCounterpartyType,
  type MessageThreadStatus,
} from "@/lib/api/messages";

export function useMessageThreads(params?: {
  counterpartyType?: MessageCounterpartyType;
  status?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...filters } = params || {};
  return useQuery({
    queryKey: ["messages", "threads", filters],
    queryFn: () => messagesApi.listThreads(filters),
    enabled,
    refetchInterval: 15_000,
  });
}

export function useMessageThread(threadId: string | null) {
  return useQuery({
    queryKey: ["messages", "thread", threadId],
    queryFn: () => messagesApi.getThread(threadId!),
    enabled: Boolean(threadId),
    refetchInterval: 15_000,
  });
}

export function useMessageCounterparties(type: MessageCounterpartyType | null, enabled = true) {
  return useQuery({
    queryKey: ["messages", "counterparties", type],
    queryFn: () => messagesApi.listCounterparties(type!),
    enabled: enabled && Boolean(type),
  });
}

export function useCreateMessageThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateThreadDto) => messagesApi.createThread(dto),
    meta: { successMessage: "Conversation started", errorMessage: "Could not start conversation" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useReplyMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) => messagesApi.reply(threadId, body),
    meta: { successMessage: "Message sent", errorMessage: "Could not send message" },
    onSuccess: (_data, { threadId }) => {
      qc.invalidateQueries({ queryKey: ["messages", "threads"] });
      qc.invalidateQueries({ queryKey: ["messages", "thread", threadId] });
    },
  });
}

export function useMarkThreadRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => messagesApi.markRead(threadId),
    meta: { skipToast: true },
    onSuccess: (_data, threadId) => {
      qc.invalidateQueries({ queryKey: ["messages", "threads"] });
      qc.invalidateQueries({ queryKey: ["messages", "thread", threadId] });
    },
  });
}

export function usePatchMessageThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      threadId,
      dto,
    }: {
      threadId: string;
      dto: { status?: MessageThreadStatus; entityType?: string | null; entityId?: string | null };
    }) => messagesApi.patchThread(threadId, dto),
    meta: { successMessage: "Conversation updated", errorMessage: "Could not update conversation" },
    onSuccess: (_data, { threadId }) => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["messages", "thread", threadId] });
    },
  });
}
