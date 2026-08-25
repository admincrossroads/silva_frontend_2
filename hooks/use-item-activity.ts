import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemActivityApi } from "@/lib/api/items";

export function useItemActivity(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["item-activity", entityType, entityId],
    queryFn: () => itemActivityApi.list(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useAddItemComment(entityType: string, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => itemActivityApi.addComment(entityType, entityId, content),
    meta: { successMessage: "Comment added", errorMessage: "Could not add comment" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["item-activity", entityType, entityId] }),
  });
}
