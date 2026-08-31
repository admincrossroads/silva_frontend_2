const ETB = "ETB";

export function formatCurrency(amount: number | null | undefined, _currency = ETB, fallback = "—") {
  if (amount == null || Number.isNaN(Number(amount))) return fallback;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: ETB,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatEtb(amount: number | null | undefined, fallback = "—") {
  return formatCurrency(amount, ETB, fallback);
}

export function formatOptionalNumber(value: number | null | undefined, fallback = "—") {
  if (value == null || Number.isNaN(Number(value))) return fallback;
  return Number(value).toLocaleString();
}

export function formatDate(value: string | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
