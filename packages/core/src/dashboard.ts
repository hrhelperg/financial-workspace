export const dashboardMetrics = [
  {
    title: "Open AR",
    value: "$48,220",
    note: "+12.4% from last month",
    icon: "dollar",
    tone: "green"
  },
  {
    title: "Cash in 30d",
    value: "$36,900",
    note: "7 scheduled payments",
    icon: "trend",
    tone: "blue"
  },
  {
    title: "Expenses",
    value: "$12,430",
    note: "62% already reconciled",
    icon: "wallet",
    tone: "amber"
  },
  {
    title: "Automation queue",
    value: "8 events",
    note: "2 rules ready for Inngest",
    icon: "automation",
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
