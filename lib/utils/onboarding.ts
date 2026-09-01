import type { AuthMe, TenantInfo } from "@/types";

export function hasCompletedOnboarding(tenant: TenantInfo | null | undefined): boolean {
  const branding = tenant?.branding as { onboardingCompletedAt?: string } | null | undefined;
  return Boolean(branding?.onboardingCompletedAt);
}

export function postAuthRedirect(me: AuthMe): string {
  return hasCompletedOnboarding(me.tenant) ? "/dashboard" : "/onboarding";
}

export function canInviteDuringOnboarding(role: string | undefined): boolean {
  return role === "vendor_admin" || role === "spx_principal";
}

export function canEditBrandingDuringOnboarding(role: string | undefined): boolean {
  return (
    role === "vendor_admin" ||
    role === "spx_principal" ||
    role === "silva_owner" ||
    role === "silva_country_manager" ||
    role === "system_admin"
  );
}
