export const settingsSections = [
  {
    title: "Workspace profile",
    description: "Organization name, base currency, billing identity, and fiscal settings.",
    status: "Ready"
  },
  {
    title: "Payment operations",
    description: "Reminder cadence, payment methods, and receivables policies.",
    status: "Planned"
  },
  {
    title: "Document storage",
    description: "Contracts, receipts, invoices, and future Cloudflare R2 configuration.",
    status: "Planned"
  },
  {
    title: "Automation rules",
    description: "Inngest-backed events for payment reminders, spend review, and document processing.",
    status: "Ready"
  }
] as const;
