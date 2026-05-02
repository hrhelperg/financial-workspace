export function formatCurrency(amount: number | string, currency = "USD", locale = "en"): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;

  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatDate(value: string | Date, locale = "en"): string {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
