import { formatCurrency, getInvoiceBalance, initialClients, initialInvoices } from "./mvp";

const openInvoices = initialInvoices.filter((invoice) => invoice.status === "sent" || invoice.status === "overdue");
const openReceivables = openInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
const overdueTotal = initialInvoices
  .filter((invoice) => invoice.status === "overdue")
  .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);

export const dashboardMetrics = [
  {
    title: "Clients",
    value: String(initialClients.length),
    note: "Active workspace relationships",
    icon: "clients",
    tone: "green"
  },
  {
    title: "Open invoices",
    value: String(openInvoices.length),
    note: "Sent or overdue invoices",
    icon: "invoices",
    tone: "blue"
  },
  {
    title: "Receivables",
    value: formatCurrency(openReceivables),
    note: "Balance still to collect",
    icon: "dollar",
    tone: "amber"
  },
  {
    title: "Overdue",
    value: formatCurrency(overdueTotal),
    note: "Needs follow-up",
    icon: "overdue",
    tone: "rose"
  }
] as const;

export const recentActivity = [
  { label: "Invoice FW-1024 sent", meta: "Acme Ledger Co.", amount: "$4,800" },
  { label: "Payment matched", meta: "Northstar Studio", amount: "$2,150" },
  { label: "Expense categorized", meta: "Cloud hosting", amount: "$382" },
  { label: "Document parsed", meta: "Consulting agreement", amount: "Ready" }
] as const;

export const cashOutlook = [
  { label: "Expected", value: "74%", colorClassName: "bg-[#0f766e]" },
  { label: "At risk", value: "18%", colorClassName: "bg-[#d97706]" },
  { label: "Overdue", value: "8%", colorClassName: "bg-[#be4444]" }
] as const;

export const operatingFocus = [
  "Collect receivables before they age",
  "Keep cashflow visible by week",
  "Link documents to clients and records",
  "Queue automations for repetitive finance tasks"
] as const;

export type DashboardMetric = (typeof dashboardMetrics)[number];
export type DashboardMetricIcon = DashboardMetric["icon"];
export type DashboardMetricTone = DashboardMetric["tone"];
