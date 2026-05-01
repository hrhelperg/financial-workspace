export function formatCurrency(amount: number | string, currency = "USD"): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;

  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
