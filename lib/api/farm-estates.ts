import api from "./index";

export type FarmEstateBlock = {
  id: string;
  code: string;
  label: string;
  areaHa: number | null;
  treeCount: number | null;
  varietyPlanted?: string | null;
  plantingDate?: string | null;
  status?: "active" | "inactive";
};

export type FarmBlockUpdateDto = {
  code?: string;
  label?: string;
  areaHa?: number | null;
  treeCount?: number | null;
  varietyPlanted?: string | null;
  plantingDate?: string | null;
  status?: "active" | "inactive";
};

export type FarmEstateVendor = {
  id: string;
  name: string;
  isPrimary: boolean;
};

export type FarmEstateOwner = {
  id: string;
  name: string;
};

export type FarmEstate = {
  id: string;
  programId: string;
  name: string;
  totalAreaHa: number | null;
  location: string | null;
  notes: string | null;
  status: "active" | "inactive";
  termStartDate: string | null;
  approverUserId: string | null;
  fieldManagerUserId: string | null;
  coreBundleElected: boolean | null;
  ownerOrganizationId: string | null;
  ownerOrganization: FarmEstateOwner | null;
  createdAt: string;
  updatedAt: string;
  vendors: FarmEstateVendor[];
  blocks: FarmEstateBlock[];
};

type Paginated<T> = { items: T[]; meta: { page: number; pageSize: number; total: number } };

export const farmEstatesApi = {
  list: (params?: { status?: string; forVendorId?: string }) =>
    api
      .get<{ data: Paginated<FarmEstate> }>("/farm-estates", { params })
      .then((r) => r.data.data.items),

  findOne: (id: string) => api.get<{ data: FarmEstate }>(`/farm-estates/${id}`).then((r) => r.data.data),

  create: (dto: {
    name: string;
    ownerOrganizationId?: string;
    totalAreaHa?: number;
    location?: string;
    notes?: string;
    status?: "active" | "inactive";
    vendorIds?: string[];
    blocks?: Array<{ code: string; label?: string; areaHa?: number; treeCount?: number }>;
  }) => api.post<{ data: FarmEstate }>("/farm-estates", dto).then((r) => r.data.data),

  update: (
    id: string,
    dto: {
      name?: string;
      ownerOrganizationId?: string | null;
      approverUserId?: string | null;
      fieldManagerUserId?: string | null;
      termStartDate?: string | null;
      coreBundleElected?: boolean | null;
      totalAreaHa?: number | null;
      location?: string | null;
      notes?: string | null;
      status?: "active" | "inactive";
    },
  ) => api.patch<{ data: FarmEstate }>(`/farm-estates/${id}`, dto).then((r) => r.data.data),

  setVendors: (id: string, vendorIds: string[]) =>
    api.put<{ data: FarmEstate }>(`/farm-estates/${id}/vendors`, { vendorIds }).then((r) => r.data.data),

  addBlock: (
    id: string,
    dto: { code: string; label?: string; areaHa?: number; treeCount?: number },
  ) => api.post<{ data: FarmEstateBlock }>(`/farm-estates/${id}/blocks`, dto).then((r) => r.data.data),

  updateBlock: (id: string, blockId: string, dto: FarmBlockUpdateDto) =>
    api
      .patch<{ data: FarmEstateBlock }>(`/farm-estates/${id}/blocks/${blockId}`, dto)
      .then((r) => r.data.data),

  removeBlock: (id: string, blockId: string) =>
    api.delete(`/farm-estates/${id}/blocks/${blockId}`).then((r) => r.data),
};
