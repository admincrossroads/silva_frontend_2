import api from "./index";

export type RegistrationOrgType = "silva" | "vendor";

export type RegistrationRequest = {
  id: string;
  orgType: RegistrationOrgType;
  status: "submitted" | "under_review" | "approved" | "rejected";
  orgName: string;
  orgSlug: string;
  displayName: string | null;
  legalName: string | null;
  country: string | null;
  region: string | null;
  address: string | null;
  website: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  contactTitle: string | null;
  assetInterests: string | null;
  estimatedHectares: number | null;
  governanceNotes: string | null;
  vendorCategory: string | null;
  servicesProvided: string | null;
  insuranceOnFile: boolean | null;
  fieldCapacity: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  provisionedOrgId: string | null;
  createdAt: string;
  reviewedBy?: { id: string; name: string; email: string } | null;
  provisionedOrg?: { id: string; name: string; slug: string; type: string } | null;
};

export type RegistrationSubmitDto = {
  orgType: RegistrationOrgType;
  orgName: string;
  orgSlug?: string;
  displayName?: string;
  legalName?: string;
  country?: string;
  region?: string;
  address?: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactTitle?: string;
  assetInterests?: string;
  estimatedHectares?: number;
  governanceNotes?: string;
  vendorCategory?: string;
  servicesProvided?: string;
  insuranceOnFile?: boolean;
  fieldCapacity?: string;
};

export const registrationApi = {
  submit: (dto: RegistrationSubmitDto) =>
    api.post<{ data: { id: string; status: string; message: string } }>("/registration-requests", dto).then((r) => r.data.data),

  checkActivation: (token: string) =>
    api
      .get<{ data: { orgName: string; orgType: string; contactName: string; contactEmail: string } }>(
        "/registration-requests/activation",
        { params: { token } },
      )
      .then((r) => r.data.data),

  activate: (body: { token: string; password: string; name?: string }) =>
    api.post<{ data: { accessToken: string; refreshToken: string; user: unknown } }>("/registration-requests/activate", body).then((r) => r.data.data),

  list: (params?: { status?: string; orgType?: string; q?: string }) =>
    api
      .get<{ data: RegistrationRequest[]; meta: { total: number } }>("/registration-requests", { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta })),

  findOne: (id: string) =>
    api.get<{ data: RegistrationRequest }>(`/registration-requests/${id}`).then((r) => r.data.data),

  markUnderReview: (id: string, notes?: string) =>
    api.post<{ data: RegistrationRequest }>(`/registration-requests/${id}/under-review`, { notes }).then((r) => r.data.data),

  approve: (id: string, notes?: string) =>
    api
      .post<{ data: { request: RegistrationRequest; activationToken: string; activationPath: string } }>(
        `/registration-requests/${id}/approve`,
        { notes },
      )
      .then((r) => r.data.data),

  reject: (id: string, notes: string) =>
    api.post<{ data: RegistrationRequest }>(`/registration-requests/${id}/reject`, { notes }).then((r) => r.data.data),
};
