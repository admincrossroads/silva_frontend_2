import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cropfortAdminApi, type CropfortRoleName, type CropfortTenantConfig } from "@/lib/api/cropfort/admin";

export function useCropfortAdminUsers() {
  return useQuery({
    queryKey: ["cropfort-admin-users"],
    queryFn: () => cropfortAdminApi.listUsers(),
  });
}

export function useCropfortTenantConfig() {
  return useQuery({
    queryKey: ["cropfort-tenant-config"],
    queryFn: () => cropfortAdminApi.getTenantConfig(),
  });
}

export function useUpdateCropfortTenantConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CropfortTenantConfig) => cropfortAdminApi.updateTenantConfig(dto),
    meta: { successMessage: "Tenant config saved", errorMessage: "Could not save config" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cropfort-tenant-config"] });
      qc.invalidateQueries({ queryKey: ["cropfort-dashboard"] });
    },
  });
}

export function useAssignCropfortRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      roles,
      removeRoles,
    }: {
      userId: string;
      roles: { role: CropfortRoleName; assignedBlockIds?: string[] }[];
      removeRoles?: CropfortRoleName[];
    }) => cropfortAdminApi.assignRoles(userId, { roles, removeRoles }),
    meta: { successMessage: "Roles updated", errorMessage: "Could not update roles" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-admin-users"] }),
  });
}

export function useSuspendCropfortUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => cropfortAdminApi.suspendUser(userId),
    meta: { successMessage: "User suspended", errorMessage: "Could not suspend user" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cropfort-admin-users"] }),
  });
}
