import { TEMPLATE_CONFIG_SCHEMA_VERSION, type TemplateConfigV1 } from "../schema";

export const FREELANCER_TEMPLATE_SLUG = "freelancer-finance-dashboard";

export const freelancerFinanceConfig: TemplateConfigV1 = {
  schemaVersion: TEMPLATE_CONFIG_SCHEMA_VERSION,
  workspace: {
    namePattern: "{{user.firstName}}'s freelance finances",
    slugPattern: "{{user.id|first8}}-freelance",
    baseCurrency: "USD"
  },
  expenseCategories: [
    { name: "Software & SaaS", type: "operating", description: "Tools, subscriptions, hosting" },
    { name: "Equipment", type: "operating", description: "Hardware, peripherals, depreciable assets" },
    { name: "Professional services", type: "operating", description: "Accountant, lawyer, contractor" },
    { name: "Travel", type: "operating", description: "Flights, lodging, transit for client work" },
    { name: "Meals & entertainment", type: "operating", description: "Client meetings, conferences" },
    { name: "Office", type: "operating", description: "Coworking, home-office portion" },
    { name: "Marketing", type: "operating", description: "Ads, website, portfolio" },
    { name: "Self-employment tax", type: "tax", taxCode: "SE" },
    { name: "Income tax estimated", type: "tax", taxCode: "EST" }
  ],
  documentFolders: [
    { pathTemplate: "documents/incoming/{{year}}", description: "Invoices you sent clients" },
    { pathTemplate: "documents/outgoing/{{year}}", description: "Bills and receipts you paid" },
    { pathTemplate: "documents/tax/{{year}}", description: "1099s, W-9s, year-end summaries", yearsBack: 1 },
    { pathTemplate: "documents/contracts", description: "Active and archived client agreements" }
  ],
  forecast: {
    horizonMonths: 12,
    expectedMonthlyIncome: 0,
    expectedMonthlyExpenses: 0
  },
  dashboard: {
    widgets: [
      { key: "incoming_total_ytd", size: "md", order: 0 },
      { key: "outgoing_total_ytd", size: "md", order: 1 },
      { key: "net_ytd", size: "md", order: 2 },
      { key: "runway_months", size: "md", order: 3 },
      { key: "outstanding_invoices", size: "lg", order: 4 },
      { key: "upcoming_tax_dates", size: "md", order: 5 }
    ]
  },
  invoiceDefaults: {
    direction: "incoming",
    paymentTermsDays: 14,
    currency: "USD"
  }
};

export const freelancerFinanceTemplate = {
  slug: FREELANCER_TEMPLATE_SLUG,
  name: "Freelancer Finance Dashboard",
  tagline: "Track income, expenses, and runway in one place — built for solo operators.",
  description:
    "A complete financial workspace for freelancers: client roster, incoming invoices, deductible expenses, a year-end tax folder, and a 12-month runway forecast. Replaces five spreadsheets and a shoebox.",
  category: "freelancer" as const,
  pricingTier: "free" as const,
  iconKey: "freelancer",
  seoTitle: "Free Freelancer Finance Template — Invoices, Expenses, Forecast",
  seoDescription:
    "Free template for freelancers: client list, invoice tracking, deductible expense categories, tax folder, and a 12-month cash forecast. One click to install.",
  config: freelancerFinanceConfig
};
