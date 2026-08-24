export function formatCurrency(amount: number | null | undefined, currency = "USD", fallback = "—") {
  if (amount == null || Number.isNaN(Number(amount))) return fallback;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
}

export function formatDate(date: string | Date | null | undefined, fallback = "—") {
  if (date == null || date === "") return fallback;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined, fallback = "—") {
  if (date == null || date === "") return fallback;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatOptionalNumber(n: number | null | undefined, fallback = "—") {
  if (n == null || Number.isNaN(n)) return fallback;
  return formatNumber(n);
}
