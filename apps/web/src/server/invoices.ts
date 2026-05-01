import "server-only";
import { count, desc, eq } from "drizzle-orm";
import {
  clients,
  db,
  invoiceItems,
  invoices,
  type Invoice,
  type InvoiceItem
} from "@financial-workspace/db";
import { getDefaultWorkspaceId } from "./workspace";

export type InvoiceStatus = Invoice["status"];

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  amountPaid: string;
  currency: string;
  clientId: string;
  clientName: string;
  itemCount: number;
};

export async function listInvoices(): Promise<InvoiceListItem[]> {
  const workspaceId = await getDefaultWorkspaceId();

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      totalAmount: invoices.totalAmount,
      amountPaid: invoices.amountPaid,
      currency: invoices.currency,
      clientId: invoices.clientId,
      clientName: clients.name
    })
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .where(eq(invoices.workspaceId, workspaceId))
    .orderBy(desc(invoices.issueDate), desc(invoices.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const itemCounts = await db
    .select({
      invoiceId: invoiceItems.invoiceId,
      total: count()
    })
    .from(invoiceItems)
    .where(eq(invoiceItems.workspaceId, workspaceId))
    .groupBy(invoiceItems.invoiceId);

  const countMap = new Map(itemCounts.map((entry) => [entry.invoiceId, Number(entry.total)]));

  return rows.map((row) => ({
    ...row,
    itemCount: countMap.get(row.id) ?? 0
  }));
}

export type CreateInvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type CreateInvoiceInput = {
  clientId: string;
  invoiceNumber?: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items: CreateInvoiceItemInput[];
};

type LineCalculation = {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  taxAmount: string;
  lineTotal: string;
  sortOrder: number;
};

type InvoiceTotals = {
  subtotal: string;
  taxTotal: string;
  total: string;
};

function toMoney(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(2);
}

function calculateLines(items: CreateInvoiceItemInput[]): {
  lines: LineCalculation[];
  totals: InvoiceTotals;
} {
  let subtotal = 0;
  let taxTotal = 0;

  const lines = items.map((item, index) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const taxAmount = lineSubtotal * (item.taxRate / 100);
    const lineTotal = lineSubtotal + taxAmount;

    subtotal += lineSubtotal;
    taxTotal += taxAmount;

    return {
      description: item.description,
      quantity: toMoney(item.quantity),
      unitPrice: toMoney(item.unitPrice),
      taxRate: toMoney(item.taxRate),
      taxAmount: toMoney(taxAmount),
      lineTotal: toMoney(lineTotal),
      sortOrder: index
    } satisfies LineCalculation;
  });

  return {
    lines,
    totals: {
      subtotal: toMoney(subtotal),
      taxTotal: toMoney(taxTotal),
      total: toMoney(subtotal + taxTotal)
    }
  };
}

async function getNextInvoiceNumber(workspaceId: string): Promise<string> {
  const [row] = await db
    .select({ total: count() })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId));

  const next = Number(row?.total ?? 0) + 1001;
  return `FW-${next}`;
}

export type CreatedInvoice = {
  invoice: Invoice;
  items: InvoiceItem[];
};

export async function createInvoice(input: CreateInvoiceInput): Promise<CreatedInvoice> {
  const workspaceId = await getDefaultWorkspaceId();
  const { lines, totals } = calculateLines(input.items);
  const invoiceNumber =
    input.invoiceNumber && input.invoiceNumber.trim().length > 0
      ? input.invoiceNumber.trim()
      : await getNextInvoiceNumber(workspaceId);

  return db.transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        workspaceId,
        clientId: input.clientId,
        invoiceNumber,
        status: input.status,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        currency: input.currency ?? "USD",
        notes: input.notes ?? null,
        terms: input.terms ?? null,
        subtotalAmount: totals.subtotal,
        taxAmount: totals.taxTotal,
        totalAmount: totals.total,
        amountPaid: input.status === "paid" ? totals.total : "0",
        sentAt: input.status === "sent" ? new Date() : null,
        paidAt: input.status === "paid" ? new Date() : null
      })
      .returning();

    if (lines.length === 0) {
      return { invoice, items: [] };
    }

    const items = await tx
      .insert(invoiceItems)
      .values(
        lines.map((line) => ({
          workspaceId,
          invoiceId: invoice.id,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: line.taxAmount,
          lineTotal: line.lineTotal,
          sortOrder: line.sortOrder
        }))
      )
      .returning();

    return { invoice, items };
  });
}
