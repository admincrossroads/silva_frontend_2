import api from "./index";

export type RegistrationOrgType = "silva" | "vendor";

export type RegistrationActivationStatus =
  | "pending_activation"
  | "active"
  | "cancelled"
  | "draft";

export type RegistrationRequest = {
  id: string;
  orgType: RegistrationOrgType;
  status: "submitted" | "under_review" | "approved" | "rejected";
  activationStatus: RegistrationActivationStatus;
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

export type RegistrationProvisionResult = {
  request: RegistrationRequest;
  activationToken?: string;
  activationPath: string;
  activationUrl: string;
  emailDelivery: { sent: boolean; provider: string; error?: string };
};

export const REGISTRATION_LIFECYCLE_LABELS: Record<RegistrationActivationStatus | "all", string> = {
  all: "All",
  pending_activation: "Pending activation",
  active: "Active",
  cancelled: "Cancelled",
  draft: "Draft",
};

export function registrationStatusLabel(row: RegistrationRequest) {
  return REGISTRATION_LIFECYCLE_LABELS[row.activationStatus] ?? row.activationStatus;
}

export function activationNote(emailDelivery?: { sent: boolean; provider: string; error?: string }) {
  if (emailDelivery?.error) return `Email failed: ${emailDelivery.error}`;
  if (emailDelivery?.sent) return "Invitation email sent to the contact.";
  return "Email not configured — copy the link below and send it manually.";
}

export const REGISTRATION_ACTIVATION_STORAGE_KEY = "cropfort:last-registration-activation";

export function fullActivationUrl(path: string) {
  if (path.startsWith("http")) return path;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export const registrationApi = {
  submit: (dto: RegistrationSubmitDto) =>
    api.post<{ data: RegistrationProvisionResult }>("/registration-requests", dto).then((r) => r.data.data),

  checkActivation: (token: string) =>
    api
      .get<{ data: { orgName: string; orgType: string; contactName: string; contactEmail: string } }>(
        "/registration-requests/activation",
        { params: { token } },
      )
      .then((r) => r.data.data),

  activate: (body: { token: string; password: string; name?: string }) =>
    api.post<{ data: { accessToken: string; refreshToken: string; user: unknown } }>("/registration-requests/activate", body).then((r) => r.data.data),

  list: (params?: { lifecycle?: string; orgType?: string; q?: string }) =>
    api
      .get<{ data: RegistrationRequest[]; meta: { total: number } }>("/registration-requests", { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta })),

  findOne: (id: string) =>
    api.get<{ data: RegistrationRequest }>(`/registration-requests/${id}`).then((r) => r.data.data),

  approve: (id: string, notes?: string) =>
    api
      .post<{ data: RegistrationProvisionResult }>(`/registration-requests/${id}/approve`, { notes })
      .then((r) => r.data.data),

  resendActivation: (id: string) =>
    api
      .post<{ data: RegistrationProvisionResult }>(`/registration-requests/${id}/send-activation`)
      .then((r) => r.data.data),

  cancel: (id: string, notes: string) =>
    api.post<{ data: RegistrationRequest }>(`/registration-requests/${id}/reject`, { notes }).then((r) => r.data.data),
};
