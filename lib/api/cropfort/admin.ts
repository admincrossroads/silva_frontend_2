import api from "../index";

export type CropfortRoleName =
  | "field_supervisor"
  | "bagro_office"
  | "spx_validator"
  | "farm_owner"
  | "spx_platform_admin";

export interface CropfortAdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  fieldOsRole?: string;
  active: boolean;
  cropfortRoles: { role: CropfortRoleName; assignedBlockIds: string[] }[];
}

export interface CropfortTenantConfig {
  cropfortCurrency?: string;
  cropfortAfeBandAMaxEtb?: number;
  cropfortAfeBandBMaxEtb?: number;
  cropfortAfeBandCMaxEtb?: number;
  cropfortRateFlagThresholdPct?: number;
  cropfortVarianceReviewPct?: number;
  cropfortOpexReserveMinMonths?: number;
  cropfortOpexReserveBalanceEtb?: number | null;
  cropfortOpexEnforcement?: "informational" | "blocking";
  cropfortHectareContractTotal?: number | null;
  cropfortPartialWeeklyRelease?: boolean;
}

export const cropfortAdminApi = {
  listUsers: () => api.get<{ data: CropfortAdminUser[] }>("/cropfort/admin/users").then((r) => r.data.data),

  provisionUser: (dto: {
    name: string;
    email: string;
    organizationId: string;
    fieldOsRole?: string;
    password?: string;
    cropfortRoles?: { role: CropfortRoleName; assignedBlockIds?: string[] }[];
  }) => api.post("/cropfort/admin/users", dto).then((r) => r.data.data),

  assignRoles: (
    userId: string,
    body: {
      roles: { role: CropfortRoleName; assignedBlockIds?: string[] }[];
      removeRoles?: CropfortRoleName[];
    },
  ) => api.patch(`/cropfort/admin/users/${userId}/roles`, body).then((r) => r.data.data),

  suspendUser: (userId: string) =>
    api.post(`/cropfort/admin/users/${userId}/suspend`).then((r) => r.data.data),

  activateUser: (userId: string) =>
    api.post(`/cropfort/admin/users/${userId}/activate`).then((r) => r.data.data),

  getTenantConfig: () =>
    api.get<{ data: CropfortTenantConfig }>("/cropfort/admin/tenant-config").then((r) => r.data.data),

  updateTenantConfig: (dto: CropfortTenantConfig) =>
    api.patch<{ data: CropfortTenantConfig }>("/cropfort/admin/tenant-config", dto).then((r) => r.data.data),
};
