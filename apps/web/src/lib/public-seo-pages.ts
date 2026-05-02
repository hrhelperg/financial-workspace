import type { Metadata } from "next";
import { BRAND_NAME } from "@financial-workspace/core";
import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";

export const CANONICAL_ORIGIN = "https://www.cashworkspace.com";
export const FREELANCER_TEMPLATE_INSTALL_PATH = `/login?next=/templates/${FREELANCER_TEMPLATE_SLUG}/install`;

export const localizedHomePaths = ["/", "/fr", "/es", "/de", "/pt", "/ru"] as const;

export const publicSeoPagePaths = [
  "/templates",
  `/templates/${FREELANCER_TEMPLATE_SLUG}`,
  "/finance-template-for-freelancers",
  "/invoice-tracking-template",
  "/expense-tracker-template",
  "/cashflow-template",
  "/small-business-finance-template",
  "/agency-finance-template",
  "/tax-export-template",
  "/financial-forecast-template"
] as const;

export const publicSitemapPaths = [...localizedHomePaths, ...publicSeoPagePaths] as const;

export type PublicSeoPath = (typeof publicSeoPagePaths)[number];

type SeoSection = {
  title: string;
  body: string;
};

export type PublicSeoPage = {
  path: PublicSeoPath;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  primaryCta: string;
  bullets: string[];
  sections: SeoSection[];
  relatedPaths: PublicSeoPath[];
};

export function canonicalUrl(path: string) {
  return `${CANONICAL_ORIGIN}${path === "/" ? "/" : path}`;
}

export const publicSeoPages = [
  {
    path: "/templates",
    title: `Finance templates for freelancers and small businesses | ${BRAND_NAME}`,
    description:
      "Explore Cash Workspace templates for invoices, expenses, cashflow, documents, fiscal folders, and accountant-ready finance operations.",
    eyebrow: "Template gallery",
    h1: "Finance templates that become a real workspace.",
    lead:
      "Start with a structured setup instead of a blank finance app. Cash Workspace templates organize invoices, expenses, forecasts, documents, and fiscal export workflows from day one.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Freelancer Finance Dashboard is available now.",
      "Upcoming templates cover small businesses, agencies, tax export, and yearly forecasting.",
      "Each template is designed around operational finance, not just invoice creation."
    ],
    sections: [
      {
        title: "Built for finance operations",
        body:
          "Templates define the working structure: invoice tracking, expense categories, fiscal folders, forecast assumptions, and dashboard starting points."
      },
      {
        title: "Ready for the rest of the product",
        body:
          "The same workspace supports tenant isolation, audit logs, idempotent installs, and accountant-ready export paths as the product grows."
      }
    ],
    relatedPaths: [
      `/templates/${FREELANCER_TEMPLATE_SLUG}`,
      "/finance-template-for-freelancers",
      "/invoice-tracking-template",
      "/cashflow-template"
    ]
  },
  {
    path: `/templates/${FREELANCER_TEMPLATE_SLUG}`,
    title: `Freelancer Finance Dashboard template | ${BRAND_NAME}`,
    description:
      "Install a freelancer finance dashboard with invoice tracking, expense organization, forecast data, fiscal folders, and accountant-ready structure.",
    eyebrow: "Live template",
    h1: "Freelancer Finance Dashboard",
    lead:
      "A ready finance workspace for independent consultants, contractors, and creators who need invoices, expenses, cashflow, documents, and fiscal organization in one place.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Track incoming sales invoices and outgoing purchase invoices.",
      "Organize expenses into useful categories before tax season.",
      "Start with example data and a simple dashboard checklist."
    ],
    sections: [
      {
        title: "Designed for getting paid",
        body:
          "The template keeps clients, invoice status, due dates, payments, and unpaid totals visible so follow-up work is easier to prioritize."
      },
      {
        title: "Designed for accountants",
        body:
          "Fiscal year, invoice direction, document paths, and export metadata are structured from the beginning so records are easier to hand off."
      }
    ],
    relatedPaths: [
      "/finance-template-for-freelancers",
      "/invoice-tracking-template",
      "/expense-tracker-template",
      "/cashflow-template"
    ]
  },
  {
    path: "/finance-template-for-freelancers",
    title: `Finance template for freelancers | ${BRAND_NAME}`,
    description:
      "A practical freelancer finance template for invoices, expenses, cashflow visibility, fiscal folders, and accountant-ready exports.",
    eyebrow: "Freelancer finance",
    h1: "A finance template for freelancers who need structure.",
    lead:
      "Replace scattered spreadsheets with a workspace that connects client invoices, expenses, forecasts, documents, and fiscal records.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "See unpaid incoming invoices and outgoing bills separately.",
      "Keep receipts, invoices, and export metadata organized by fiscal year.",
      "Use a simple forecast to understand expected income, expenses, and net cash."
    ],
    sections: [
      {
        title: "Less month-end cleanup",
        body:
          "The template gives freelancers a consistent place to maintain clients, invoice status, spending categories, and document organization."
      },
      {
        title: "Better handoff",
        body:
          "Fiscal folders and accountant-ready export preparation reduce the manual sorting that usually happens right before tax deadlines."
      }
    ],
    relatedPaths: [
      `/templates/${FREELANCER_TEMPLATE_SLUG}`,
      "/invoice-tracking-template",
      "/expense-tracker-template",
      "/tax-export-template"
    ]
  },
  {
    path: "/invoice-tracking-template",
    title: `Invoice tracking template | ${BRAND_NAME}`,
    description:
      "Track draft, sent, paid, overdue, and cancelled invoices with client context, due dates, fiscal years, and cashflow direction.",
    eyebrow: "Invoice tracking",
    h1: "Track invoices without losing financial context.",
    lead:
      "Cash Workspace treats invoices as part of a wider finance system: client records, payment status, cash direction, fiscal year, documents, and auditability.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Separate incoming sales invoices from outgoing supplier bills.",
      "Filter by status and due date for practical follow-up.",
      "Keep invoice numbers unique inside each workspace."
    ],
    sections: [
      {
        title: "Built for follow-up",
        body:
          "Invoice status and due dates help freelancers and small teams see what needs attention before unpaid work becomes a cashflow issue."
      },
      {
        title: "Built for records",
        body:
          "Invoice direction, fiscal year, storage paths, and audit logs prepare the data model for accountant-ready exports."
      }
    ],
    relatedPaths: [
      "/finance-template-for-freelancers",
      "/expense-tracker-template",
      "/cashflow-template",
      "/tax-export-template"
    ]
  },
  {
    path: "/expense-tracker-template",
    title: `Expense tracker template | ${BRAND_NAME}`,
    description:
      "Organize business expenses by category, date, workspace, and documents so spending is easier to review and export.",
    eyebrow: "Expense tracking",
    h1: "An expense tracker that fits the rest of your finance workspace.",
    lead:
      "Track spending alongside invoices, documents, fiscal folders, and cashflow assumptions instead of maintaining a separate expense sheet.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Start with practical categories for operating costs, software, tax, and other spend.",
      "Review expenses by date and workspace for cleaner bookkeeping.",
      "Connect expense records to documents and future accountant exports."
    ],
    sections: [
      {
        title: "Useful categories from day one",
        body:
          "The freelancer template seeds categories so users can record expenses immediately and refine the setup later."
      },
      {
        title: "Connected to cashflow",
        body:
          "Expense data supports the dashboard and forecast foundation, making expected net cash easier to reason about."
      }
    ],
    relatedPaths: [
      "/finance-template-for-freelancers",
      "/invoice-tracking-template",
      "/cashflow-template",
      "/financial-forecast-template"
    ]
  },
  {
    path: "/cashflow-template",
    title: `Cashflow template for small teams | ${BRAND_NAME}`,
    description:
      "Use a simple cashflow template to compare incoming unpaid invoices, outgoing unpaid bills, expected income, and expected expenses.",
    eyebrow: "Cashflow",
    h1: "A cashflow template for clearer short-term decisions.",
    lead:
      "Cash Workspace keeps cashflow lightweight: unpaid incoming invoices, unpaid outgoing bills, expected income, expected expenses, and projected net.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "See incoming unpaid and outgoing unpaid totals separately.",
      "Use yearly forecast assumptions for expected income and expenses.",
      "Keep cashflow connected to invoices and expenses instead of a disconnected model."
    ],
    sections: [
      {
        title: "Accounting-lite by design",
        body:
          "This is not a full double-entry accounting system. It is a practical forecast layer for freelancers and small businesses that need operational clarity."
      },
      {
        title: "Ready to expand",
        body:
          "The forecast foundation can later support richer templates, reminders, and exports without changing the basic workspace model."
      }
    ],
    relatedPaths: [
      "/financial-forecast-template",
      "/invoice-tracking-template",
      "/expense-tracker-template",
      "/small-business-finance-template"
    ]
  },
  {
    path: "/small-business-finance-template",
    title: `Small business finance template | ${BRAND_NAME}`,
    description:
      "A coming finance workspace template for small businesses managing invoices, expenses, documents, cashflow, and accountant exports.",
    eyebrow: "Coming soon",
    h1: "Small Business Finance OS",
    lead:
      "A planned workspace for owner-operated businesses that need a repeatable finance process across sales invoices, supplier bills, receipts, and forecasts.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Designed for recurring finance routines, not one-off invoice creation.",
      "Will support fiscal folders and export-ready document organization.",
      "Start now with the Freelancer template while the small business version is prepared."
    ],
    sections: [
      {
        title: "For operators",
        body:
          "The template is intended for small teams that need predictable review habits around receivables, payables, spending, and cash."
      },
      {
        title: "For cleaner records",
        body:
          "The workspace structure keeps business documents and financial records organized for tax and accounting workflows."
      }
    ],
    relatedPaths: [
      "/templates",
      "/cashflow-template",
      "/invoice-tracking-template",
      "/tax-export-template"
    ]
  },
  {
    path: "/agency-finance-template",
    title: `Agency finance workspace template | ${BRAND_NAME}`,
    description:
      "A coming finance workspace template for agencies that need client invoice tracking, expense visibility, forecasts, and export organization.",
    eyebrow: "Coming soon",
    h1: "Agency Finance Workspace",
    lead:
      "A planned agency template for client-driven teams that need clearer visibility into invoices, project-related expenses, cashflow, and financial documents.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Designed around client work and recurring invoice follow-up.",
      "Will connect income, expenses, fiscal records, and forecast assumptions.",
      "Keeps the current live Freelancer template as the starting point."
    ],
    sections: [
      {
        title: "Client-centered finance",
        body:
          "Agencies need finance data grouped around clients and workstreams, not just a flat list of invoices and receipts."
      },
      {
        title: "Operational visibility",
        body:
          "The planned template focuses on cash visibility, collection follow-up, and export-ready records for accountants."
      }
    ],
    relatedPaths: [
      "/templates",
      "/invoice-tracking-template",
      "/cashflow-template",
      "/financial-forecast-template"
    ]
  },
  {
    path: "/tax-export-template",
    title: `Tax and accountant export template | ${BRAND_NAME}`,
    description:
      "Prepare fiscal-year invoice folders, incoming and outgoing document groups, and summary metadata for accountant-ready exports.",
    eyebrow: "Tax export",
    h1: "Prepare financial records for accountant handoff.",
    lead:
      "Cash Workspace organizes invoice and document records by fiscal year and direction so export workflows can produce cleaner accountant packages.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Group invoices by fiscal year, incoming sales, and outgoing purchase records.",
      "Prepare summary CSV metadata for review.",
      "Use fallback metadata when PDF files are not available yet."
    ],
    sections: [
      {
        title: "Designed before tax season",
        body:
          "Fiscal organization is built into invoice and document records instead of being added as a last-minute cleanup step."
      },
      {
        title: "Export-ready structure",
        body:
          "The export foundation is prepared for ZIP packages with incoming, outgoing, and summary data."
      }
    ],
    relatedPaths: [
      "/finance-template-for-freelancers",
      "/invoice-tracking-template",
      "/expense-tracker-template",
      "/cashflow-template"
    ]
  },
  {
    path: "/financial-forecast-template",
    title: `Financial forecast template | ${BRAND_NAME}`,
    description:
      "Use a simple yearly forecast template for expected income, expected expenses, and projected net cash visibility.",
    eyebrow: "Forecast",
    h1: "A simple financial forecast template for yearly planning.",
    lead:
      "Set expected income and expected expenses for the year, then compare projected net against real invoices and spending as the workspace grows.",
    primaryCta: "Use the Freelancer template",
    bullets: [
      "Track expected income and expected expenses by year.",
      "Calculate projected net without adding complex accounting workflows.",
      "Keep forecast assumptions connected to the dashboard."
    ],
    sections: [
      {
        title: "Minimal on purpose",
        body:
          "The forecast layer gives freelancers and small businesses a useful planning baseline without forcing advanced finance modeling."
      },
      {
        title: "Connected to real work",
        body:
          "Forecasting lives alongside invoices, expenses, documents, and exports, so planning does not become another disconnected spreadsheet."
      }
    ],
    relatedPaths: [
      "/cashflow-template",
      "/expense-tracker-template",
      "/invoice-tracking-template",
      "/small-business-finance-template"
    ]
  }
] as const satisfies PublicSeoPage[];

export const publicSeoPagesByPath = publicSeoPages.reduce(
  (pagesByPath, page) => {
    pagesByPath[page.path] = page;
    return pagesByPath;
  },
  {} as Record<PublicSeoPath, PublicSeoPage>
);

export function getPublicSeoPage(path: string): PublicSeoPage | null {
  return path in publicSeoPagesByPath ? publicSeoPagesByPath[path as PublicSeoPath] : null;
}

export function createPublicSeoMetadata(page: PublicSeoPage): Metadata {
  const url = canonicalUrl(page.path);

  return {
    alternates: {
      canonical: url
    },
    description: page.description,
    openGraph: {
      description: page.description,
      siteName: BRAND_NAME,
      title: page.title,
      type: "website",
      url
    },
    title: page.title,
    twitter: {
      card: "summary_large_image",
      description: page.description,
      title: page.title
    }
  };
}
