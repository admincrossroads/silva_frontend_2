export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organizationType: string;
  vendorId?: string | null;
  activeProgramId?: string | null;
  active: boolean;
  avatar?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  tagline?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  type: string;
  branding: TenantBranding | null;
  status: string;
}

export interface ProgramInfo {
  id: string;
  name: string;
  slug: string;
  status?: string;
  branding?: TenantBranding | null;
  roleInProgram?: string | null;
}

export interface AuthMe {
  user: User;
  tenant: TenantInfo;
  activeProgram: ProgramInfo | null;
  programs: ProgramInfo[];
  memberships: Array<{ id: string; organizationId: string; role: string; active: boolean }>;
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
  /** Full workspace session — preferred so the client can skip a second /auth/me call */
  me?: AuthMe;
}

export interface BudgetVsActualRow {
  afpLineId: string;
  activity: string;
  budgetAllocatedUsd: number;
  budgetAllocatedEtb?: number | null;
  plannedUsd?: number;
  plannedEtb?: number;
  committedUsd: number;
  actualUsd: number;
  utilizationPercent: number;
  health: string;
}

export interface Schedule3Threshold {
  band: string;
  minValueUsd: number;
  maxValueUsd: number | null;
  spxAuthority: string;
  silvaAuthority: string;
  effectiveYear: number;
}

export interface Schedule4Rule {
  id: string;
  party: string;
  coverageType: string;
  minimumCoverageUsd: number;
  beneficiary: string;
}

export interface AccountabilityRow {
  operatingDiscipline: string;
  executeRole: string;
  validateRole: string;
  decideRole: string;
  authorRole: string;
  schedule3Ref: string;
}

export interface NotificationItem {
  id: string;
  triggerType: string;
  entityType: string;
  entityId: string;
  message: string;
  acknowledged: boolean;
  sentAt: string;
}

export interface Afp {
  id: string;
  year: number;
  operatingDiscipline: string;
  activity: string;
  budgetAllocatedUsd: number | null;
  kpiTarget: string;
  notes: string | null;
  status: string;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Afe {
  id: string;
  afpLineId: string;
  operatingDiscipline: string;
  description: string;
  estimatedCostUsd: number;
  band: string;
  status: string;
  silvaApprovalRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  afeId: string;
  activityCatalogId?: string | null;
  category: string;
  activity: string;
  tier: string;
  status: string;
  weekStart: number;
  weekEnd: number;
  assignedVendorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldTicket {
  id: string;
  workOrderId: string;
  activityCatalogId?: string | null;
  ticketType?: "field_execution" | "payroll_confirmation";
  activityRecorded: string;
  areaHa: number;
  laborCount: number;
  materialsUsed?: string | null;
  actualQuantity?: number | null;
  actualMandays?: number | null;
  actualCostEtb?: number | null;
  normValidation?: {
    ok?: boolean;
    flags?: Array<{ code: string; message: string; blockPayment?: boolean }>;
  } | null;
  ticketDate: string;
  status: string;
  signedOff?: boolean;
  paymentRequestId?: string | null;
  submittedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  workOrderId: string;
  fieldTicketId: string;
  type: string;
  amountRequestedEtb: number;
  status: string;
  settlementId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  workOrderId: string;
  paymentRequestId: string;
  type: string;
  payee: string;
  amountEtb: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  servicesProvided: string;
  prequalified: boolean;
  insuranceOnFile: boolean;
  insuranceExpiry: string | null;
  status: string;
  isDefaultExecutionPartner: boolean;
  createdAt: string;
}

export interface ReportSection {
  key: string;
  title: string;
  payload: unknown;
}

export interface Report {
  id: string;
  type: string;
  period: string;
  status: string;
  narrative: string | null;
  generatedAt?: string | null;
  releasedAt?: string | null;
  visibleToSilva?: boolean;
  sections?: ReportSection[];
  createdAt?: string;
}
