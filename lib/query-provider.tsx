"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "@/lib/toast";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Shown on success. Omit to skip success toast. */
      successMessage?: string;
      /** Optional success description line */
      successDescription?: string;
      /** Fallback error title when the API message is missing */
      errorMessage?: string;
      /** Skip all toasts for this mutation */
      skipToast?: boolean;
    };
  }
}

function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        const meta = mutation.meta;
        if (meta?.skipToast || !meta?.successMessage) return;
        toast.success(meta.successMessage, meta.successDescription);
      },
      onError: (error, _variables, _context, mutation) => {
        const meta = mutation.meta;
        if (meta?.skipToast) return;
        toast.error(error, meta?.errorMessage ?? "Something went wrong");
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
