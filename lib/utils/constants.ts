export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  validated: "bg-indigo-100 text-indigo-800 border-indigo-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  issued: "bg-cyan-100 text-cyan-800 border-cyan-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  settled: "bg-green-100 text-green-800 border-green-200",
  verified: "bg-purple-100 text-purple-800 border-purple-200",
  pending: "bg-orange-100 text-orange-800 border-orange-200",
};

export const BAND_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-green-100", text: "text-green-800", label: "Band A (≤5k ETB)" },
  B: { bg: "bg-blue-100", text: "text-blue-800", label: "Band B (5k–20k ETB)" },
  C: { bg: "bg-amber-100", text: "text-amber-800", label: "Band C (20k–50k ETB)" },
  D: { bg: "bg-red-100", text: "text-red-800", label: "Band D (>50k ETB)" },
};

export const ROLES = {
  silva_owner: "Silva Owner",
  silva_country_manager: "Silva Country Manager",
  silva_finance: "Silva Finance",
  spx_principal: "SPX Principal",
  spx_account_handler: "SPX Account Handler",
  spx_field_supervisor: "SPX Field Supervisor",
  system_admin: "System Admin",
  vendor_admin: "Vendor Admin",
  vendor_manager: "Vendor Manager",
  vendor_supervisor: "Vendor Supervisor",
  vendor_field_lead: "Vendor Field Lead",
  vendor_worker: "Vendor Worker",
} as const;

export type RoleKey = keyof typeof ROLES;

export const SILVA_ROLES: RoleKey[] = ["silva_owner", "silva_country_manager", "silva_finance"];
export const SPX_ROLES: RoleKey[] = ["spx_principal", "spx_account_handler", "spx_field_supervisor", "system_admin"];
export const VENDOR_ROLES: RoleKey[] = [
  "vendor_admin",
  "vendor_manager",
  "vendor_supervisor",
  "vendor_field_lead",
  "vendor_worker",
];
/** SPX can create, edit, submit, and promote annual work plans */
export const SPX_WORK_PLAN_ROLES: RoleKey[] = [
  "spx_principal",
  "spx_account_handler",
  "spx_field_supervisor",
  "system_admin",
];
/** Vendor roles that can create and submit annual work plans for SPX review */
export const VENDOR_WORK_PLAN_ROLES: RoleKey[] = ["vendor_admin", "vendor_manager"];
export const WORK_PLAN_MANAGE_ROLES: RoleKey[] = [...SPX_WORK_PLAN_ROLES, ...VENDOR_WORK_PLAN_ROLES];
