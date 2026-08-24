/** GET paths that should receive the active `farmEstateId` query param. */
export const FARM_ESTATE_SCOPED_PATH_PREFIXES = [
  "/work-plans",
  "/work-orders",
  "/field-tickets",
  "/dashboard/",
  "/ifs-forms",
  "/season-calendars",
  "/payment-requests",
  "/settlements",
];

export function shouldScopeRequest(url?: string): boolean {
  if (!url) return false;
  const path = url.split("?")[0] ?? url;
  return FARM_ESTATE_SCOPED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}
