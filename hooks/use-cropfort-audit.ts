import { useQuery } from "@tanstack/react-query";
import { cropfortAuditApi } from "@/lib/api/cropfort/audit";

export function useCropfortAudit(params?: {
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["cropfort-audit", params],
    queryFn: () => cropfortAuditApi.list(params),
  });
}
