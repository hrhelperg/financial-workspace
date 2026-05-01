import type { Client as DbClient, Invoice as DbInvoice, InvoiceItem as DbInvoiceItem } from "@financial-workspace/db/schema";

type DrizzleInvoiceStatus = DbInvoice["status"];

export const invoiceStatuses = ["draft", "sent", "paid", "overdue", "cancelled"] as const satisfies readonly DrizzleInvoiceStatus[];

export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  cancelled: "Cancelled",
  draft: "Draft",
  overdue: "Overdue",
  paid: "Paid",
  sent: "Sent"
};

export const invoiceStatusTones: Record<InvoiceStatus, "amber" | "blue" | "green" | "neutral" | "rose"> = {
  cancelled: "neutral",
  draft: "amber",
  overdue: "rose",
  paid: "green",
  sent: "blue"
};

export type ClientRecord = Pick<DbClient, "id" | "name" | "companyName" | "email" | "phone" | "notes"> & {
  status: "Active" | "Onboarding" | "Review";
  invoiceCount: number;
  lastActivity: string;
};

export type InvoiceLineItem = Pick<DbInvoiceItem, "description"> & {
  id: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
};

export type InvoiceRecord = Pick<
  DbInvoice,
  "id" | "workspaceId" | "invoiceNumber" | "issueDate" | "dueDate" | "currency" | "notes" | "terms"
> & {
  clientId: string;
  clientName: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  items: InvoiceLineItem[];
};

export const initialClients: ClientRecord[] = [
  {
    id: "client-acme",
    name: "Acme Ledger Co.",
    companyName: "Acme Ledger Co.",
    email: "maria@acme.example",
    phone: "+1 415 555 0132",
    notes: "Monthly advisory and cleanup work.",
    status: "Active",
    invoiceCount: 3,
    lastActivity: "Invoice sent today"
  },
  {
    id: "client-northstar",
    name: "Northstar Studio",
    companyName: "Northstar Studio",
    email: "finance@northstar.example",
    phone: "+1 212 555 0189",
    notes: "Design retainer with recurring billing.",
    status: "Active",
    invoiceCount: 2,
    lastActivity: "Payment matched"
  },
  {
    id: "client-harbor",
    name: "Harbor Advisory",
    companyName: "Harbor Advisory",
    email: "ops@harbor.example",
    phone: "+1 617 555 0144",
    notes: "Onboarding documents pending.",
    status: "Onboarding",
    invoiceCount: 0,
    lastActivity: "Client created"
  },
  {
    id: "client-pine",
    name: "Pine Labs",
    companyName: "Pine Labs",
    email: "ap@pine.example",
    phone: "+1 303 555 0108",
    notes: "Prefers invoices sent on Fridays.",
    status: "Review",
    invoiceCount: 1,
    lastActivity: "Draft invoice prepared"
  }
];

export const initialInvoices: InvoiceRecord[] = [
  {
    id: "invoice-fw-1024",
    workspaceId: "workspace-demo",
    clientId: "client-acme",
    clientName: "Acme Ledger Co.",
    invoiceNumber: "FW-1024",
    status: "sent",
    issueDate: "2026-05-01",
    dueDate: "2026-05-12",
    currency: "USD",
    notes: "Send payment reminder three days before due date.",
    terms: "Net 14",
    subtotal: 4800,
    taxTotal: 0,
    total: 4800,
    amountPaid: 0,
    items: [
      {
        id: "item-fw-1024-1",
        description: "Monthly financial operations support",
        quantity: 1,
        unitPrice: 4800,
        taxRate: 0,
        lineTotal: 4800
      }
    ]
  },
  {
    id: "invoice-fw-1023",
    workspaceId: "workspace-demo",
    clientId: "client-pine",
    clientName: "Pine Labs",
    invoiceNumber: "FW-1023",
    status: "draft",
    issueDate: "2026-05-01",
    dueDate: "2026-05-16",
    currency: "USD",
    notes: "Draft awaiting final expense pass-through.",
    terms: "Net 15",
    subtotal: 6400,
    taxTotal: 0,
    total: 6400,
    amountPaid: 0,
    items: [
      {
        id: "item-fw-1023-1",
        description: "Implementation sprint",
        quantity: 4,
        unitPrice: 1600,
        taxRate: 0,
        lineTotal: 6400
      }
    ]
  },
  {
    id: "invoice-fw-1022",
    workspaceId: "workspace-demo",
    clientId: "client-northstar",
    clientName: "Northstar Studio",
    invoiceNumber: "FW-1022",
    status: "paid",
    issueDate: "2026-04-14",
    dueDate: "2026-04-28",
    currency: "USD",
    notes: "Matched to bank transfer.",
    terms: "Net 14",
    subtotal: 2150,
    taxTotal: 0,
    total: 2150,
    amountPaid: 2150,
    items: [
      {
        id: "item-fw-1022-1",
        description: "Retainer support",
        quantity: 1,
        unitPrice: 2150,
        taxRate: 0,
        lineTotal: 2150
      }
    ]
  },
  {
    id: "invoice-fw-1021",
    workspaceId: "workspace-demo",
    clientId: "client-acme",
    clientName: "Acme Ledger Co.",
    invoiceNumber: "FW-1021",
    status: "overdue",
    issueDate: "2026-04-10",
    dueDate: "2026-04-24",
    currency: "USD",
    notes: "Escalate reminder cadence if unpaid this week.",
    terms: "Net 14",
    subtotal: 8000,
    taxTotal: 0,
    total: 8000,
    amountPaid: 0,
    items: [
      {
        id: "item-fw-1021-1",
        description: "Quarterly close package",
        quantity: 1,
        unitPrice: 8000,
        taxRate: 0,
        lineTotal: 8000
      }
    ]
  }
];

export function calculateInvoiceItems(items: InvoiceLineItem[]) {
  return items.map((item) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate / 100);

    return {
      ...item,
      lineTotal: Number((subtotal + tax).toFixed(2))
    };
  });
}

export function calculateInvoiceTotals(items: InvoiceLineItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100), 0);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    total: Number((subtotal + taxTotal).toFixed(2))
  };
}

export function getInvoiceBalance(invoice: InvoiceRecord) {
  return Math.max(invoice.total - invoice.amountPaid, 0);
}

export function getClientBalance(clientId: string, invoices: InvoiceRecord[]) {
  return invoices
    .filter((invoice) => invoice.clientId === clientId && invoice.status !== "cancelled")
    .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}
