import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import {
  auditLogs,
  clients,
  db,
  invoiceIdempotencyKeys,
  invoiceItems,
  invoices,
  type Invoice,
  type InvoiceItem
} from "@financial-workspace/db";
import { requireWorkspaceMember, requireWorkspaceRole } from "./workspace";
import type { UpdateInvoicePayload } from "./validation";

export type InvoiceStatus = Invoice["status"];
export type InvoiceDirection = Invoice["direction"];
export type InvoiceDirectionFilter = "all" | InvoiceDirection;

const lockedInvoiceStatuses = ["sent", "paid"] as const satisfies readonly InvoiceStatus[];
const lockedInvoiceMutationFields = new Set([
  "amount",
  "clientId",
  "client_id",
  "currency",
  "direction",
  "dueDate",
  "due_date",
  "invoiceNumber",
  "invoice_number",
  "issueDate",
  "issue_date",
  "items",
  "status",
  "terms",
  "totalAmount",
  "total_amount"
]);

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  direction: InvoiceDirection;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  fiscalYear: number;
  storagePath: string | null;
  totalAmount: string;
  amountPaid: string;
  currency: string;
  clientId: string;
  clientName: string;
  itemCount: number;
};

export async function listInvoices(filters: { direction?: InvoiceDirectionFilter } = {}): Promise<InvoiceListItem[]> {
  const { workspace } = await requireWorkspaceMember();
  const direction = filters.direction ?? "all";
  const baseFilter = and(eq(invoices.workspaceId, workspace.id), isNull(invoices.deletedAt));
  const workspaceFilter =
    direction === "all" ? baseFilter : and(baseFilter, eq(invoices.direction, direction));

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      direction: invoices.direction,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      fiscalYear: invoices.fiscalYear,
      storagePath: invoices.storagePath,
      totalAmount: invoices.totalAmount,
      amountPaid: invoices.amountPaid,
      currency: invoices.currency,
      clientId: invoices.clientId,
      clientName: clients.name
    })
    .from(invoices)
    .innerJoin(clients, and(eq(clients.id, invoices.clientId), eq(clients.workspaceId, workspace.id)))
    .where(workspaceFilter)
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
    .where(eq(invoiceItems.workspaceId, workspace.id))
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
  direction?: InvoiceDirection;
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

function getFiscalYearFromIssueDate(issueDate: string): number {
  const date = new Date(`${issueDate}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Issue date must be valid.");
  }

  return date.getUTCFullYear();
}

function buildInvoiceStoragePath(input: {
  workspaceId: string;
  fiscalYear: number;
  direction: InvoiceDirection;
  invoiceId: string;
}) {
  return `workspaces/${input.workspaceId}/fiscal/${input.fiscalYear}/${input.direction}/invoices/${input.invoiceId}.pdf`;
}

function isLockedInvoiceStatus(status: InvoiceStatus) {
  return lockedInvoiceStatuses.includes(status as (typeof lockedInvoiceStatuses)[number]);
}

function getLockedMutationAttempts(attemptedFields: readonly string[]): string[] {
  return attemptedFields.filter((field) => lockedInvoiceMutationFields.has(field));
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
  replayed?: boolean;
};

export class IdempotencyConflictError extends Error {
  constructor() {
    super("Idempotency key reused with a different request body.");
    this.name = "IdempotencyConflictError";
  }
}

export function isIdempotencyConflictError(error: unknown) {
  return error instanceof IdempotencyConflictError;
}

export type CreateInvoiceOptions = {
  idempotencyKey?: string | null;
};

function hashCreateInvoiceInput(input: CreateInvoiceInput): string {
  const canonical = {
    clientId: input.clientId,
    invoiceNumber: input.invoiceNumber?.trim() || null,
    direction: input.direction ?? "incoming",
    status: input.status,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    currency: input.currency ?? "USD",
    notes: input.notes ?? null,
    terms: input.terms ?? null,
    items: input.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate
    }))
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

async function loadCreatedInvoice(workspaceId: string, invoiceId: string): Promise<CreatedInvoice | null> {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
    .limit(1);

  if (!invoice) {
    return null;
  }

  const items = await db
    .select()
    .from(invoiceItems)
    .where(and(eq(invoiceItems.invoiceId, invoiceId), eq(invoiceItems.workspaceId, workspaceId)));

  return { invoice, items };
}

export async function createInvoice(
  input: CreateInvoiceInput,
  options: CreateInvoiceOptions = {}
): Promise<CreatedInvoice> {
  const { user, workspace } = await requireWorkspaceRole(["member"]);
  const workspaceId = workspace.id;
  const idempotencyKey = options.idempotencyKey?.trim() || null;
  const requestHash = idempotencyKey ? hashCreateInvoiceInput(input) : null;

  if (idempotencyKey) {
    const [existing] = await db
      .select()
      .from(invoiceIdempotencyKeys)
      .where(
        and(eq(invoiceIdempotencyKeys.workspaceId, workspaceId), eq(invoiceIdempotencyKeys.key, idempotencyKey))
      )
      .limit(1);

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new IdempotencyConflictError();
      }

      const replay = await loadCreatedInvoice(workspaceId, existing.invoiceId);
      if (replay) {
        return { ...replay, replayed: true };
      }
    }
  }

  const invoiceId = randomUUID();
  const direction = input.direction ?? "incoming";
  const fiscalYear = getFiscalYearFromIssueDate(input.issueDate);
  const storagePath = buildInvoiceStoragePath({ workspaceId, fiscalYear, direction, invoiceId });
  const { lines, totals } = calculateLines(input.items);
  const invoiceNumber =
    input.invoiceNumber && input.invoiceNumber.trim().length > 0
      ? input.invoiceNumber.trim()
      : await getNextInvoiceNumber(workspaceId);

  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(eq(clients.id, input.clientId), eq(clients.workspaceId, workspaceId), isNull(clients.deletedAt))
    )
    .limit(1);

  if (!client) {
    throw new Error("Client does not belong to this workspace.");
  }

  return db.transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values({
        id: invoiceId,
        workspaceId,
        clientId: input.clientId,
        invoiceNumber,
        direction,
        status: input.status,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        fiscalYear,
        storagePath,
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

    let items: InvoiceItem[] = [];

    if (lines.length === 0) {
      await tx.insert(auditLogs).values({
        workspaceId,
        actorUserId: user.id,
        action: "create",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: {
          changed_fields: ["invoice"],
          direction,
          fiscal_year: fiscalYear
        }
      });
    } else {
      items = await tx
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

      await tx.insert(auditLogs).values({
        workspaceId,
        actorUserId: user.id,
        action: "create",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: {
          changed_fields: ["invoice", "items", "amount"],
          direction,
          fiscal_year: fiscalYear
        }
      });
    }

    if (idempotencyKey && requestHash) {
      try {
        await tx.insert(invoiceIdempotencyKeys).values({
          workspaceId,
          key: idempotencyKey,
          invoiceId: invoice.id,
          requestHash,
          actorUserId: user.id
        });
      } catch (error) {
        // A concurrent request with the same key won the race. Surface as conflict
        // so the caller can re-issue and hit the replay branch.
        throw new IdempotencyConflictError();
      }
    }

    return { invoice, items };
  });
}

export type UpdatedInvoice = {
  invoice: Invoice;
  items?: InvoiceItem[];
};

function recordChangedField(changedFields: string[], field: string, changed: boolean) {
  if (changed && !changedFields.includes(field)) {
    changedFields.push(field);
  }
}

export async function updateInvoice(invoiceId: string, input: UpdateInvoicePayload): Promise<UpdatedInvoice> {
  const { user, workspace } = await requireWorkspaceRole(["member"]);
  const workspaceId = workspace.id;

  const [existing] = await db
    .select()
    .from(invoices)
    .where(
      and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId), isNull(invoices.deletedAt))
    )
    .limit(1);

  if (!existing) {
    throw new Error("Invoice not found.");
  }

  if (isLockedInvoiceStatus(existing.status)) {
    const lockedAttempts = getLockedMutationAttempts(input.attemptedFields);

    if (lockedAttempts.length > 0) {
      throw new Error("Invoice is locked and cannot be modified");
    }
  }

  const changedFields: string[] = [];
  const nextIssueDate = input.issueDate ?? existing.issueDate;
  const nextDirection = input.direction ?? existing.direction;
  const nextFiscalYear = getFiscalYearFromIssueDate(nextIssueDate);
  const nextStoragePath = buildInvoiceStoragePath({
    workspaceId,
    fiscalYear: nextFiscalYear,
    direction: nextDirection,
    invoiceId: existing.id
  });

  if (input.clientId) {
    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.id, input.clientId), eq(clients.workspaceId, workspaceId)))
      .limit(1);

    if (!client) {
      throw new Error("Client does not belong to this workspace.");
    }
  }

  let recalculated:
    | {
        lines: LineCalculation[];
        totals: InvoiceTotals;
      }
    | undefined;

  if (input.items) {
    recalculated = calculateLines(input.items);
    recordChangedField(changedFields, "items", true);
    recordChangedField(changedFields, "amount", true);
  }

  recordChangedField(changedFields, "invoice_number", input.invoiceNumber !== undefined && input.invoiceNumber !== existing.invoiceNumber);
  recordChangedField(changedFields, "client_id", input.clientId !== undefined && input.clientId !== existing.clientId);
  recordChangedField(changedFields, "direction", input.direction !== undefined && input.direction !== existing.direction);
  recordChangedField(changedFields, "status", input.status !== undefined && input.status !== existing.status);
  recordChangedField(changedFields, "issue_date", input.issueDate !== undefined && input.issueDate !== existing.issueDate);
  recordChangedField(changedFields, "due_date", input.dueDate !== undefined && input.dueDate !== existing.dueDate);
  recordChangedField(changedFields, "currency", input.currency !== undefined && input.currency !== existing.currency);
  recordChangedField(changedFields, "notes", input.notes !== undefined && input.notes !== existing.notes);
  recordChangedField(changedFields, "terms", input.terms !== undefined && input.terms !== existing.terms);

  const statusChanged = changedFields.includes("status");
  const nonStatusChangedFields = changedFields.filter((field) => field !== "status");

  if (changedFields.length === 0) {
    return { invoice: existing };
  }

  return db.transaction(async (tx) => {
    const now = new Date();
    const nextStatus = input.status ?? existing.status;
    const values: Partial<typeof invoices.$inferInsert> = {
      updatedAt: now
    };

    if (input.invoiceNumber !== undefined) {
      values.invoiceNumber = input.invoiceNumber && input.invoiceNumber.length > 0 ? input.invoiceNumber : existing.invoiceNumber;
    }
    if (input.clientId !== undefined) {
      values.clientId = input.clientId;
    }
    if (input.direction !== undefined) {
      values.direction = input.direction;
    }
    if (input.status !== undefined) {
      values.status = input.status;
    }
    if (input.issueDate !== undefined) {
      values.issueDate = input.issueDate;
    }
    if (input.dueDate !== undefined) {
      values.dueDate = input.dueDate;
    }
    if (input.currency !== undefined) {
      values.currency = input.currency;
    }
    if (input.notes !== undefined) {
      values.notes = input.notes;
    }
    if (input.terms !== undefined) {
      values.terms = input.terms;
    }

    if (input.issueDate !== undefined || input.direction !== undefined) {
      values.fiscalYear = nextFiscalYear;
      values.storagePath = nextStoragePath;
    }

    if (recalculated) {
      values.subtotalAmount = recalculated.totals.subtotal;
      values.taxAmount = recalculated.totals.taxTotal;
      values.totalAmount = recalculated.totals.total;
    }

    if (statusChanged) {
      values.sentAt = nextStatus === "sent" && !existing.sentAt ? now : existing.sentAt;
      values.paidAt = nextStatus === "paid" && !existing.paidAt ? now : existing.paidAt;

      if (nextStatus === "paid") {
        values.amountPaid = recalculated ? recalculated.totals.total : existing.totalAmount;
      }
    }

    const [updated] = await tx
      .update(invoices)
      .set(values)
      .where(and(eq(invoices.id, existing.id), eq(invoices.workspaceId, workspaceId)))
      .returning();

    let updatedItems: InvoiceItem[] | undefined;

    if (recalculated) {
      await tx
        .delete(invoiceItems)
        .where(and(eq(invoiceItems.workspaceId, workspaceId), eq(invoiceItems.invoiceId, existing.id)));

      updatedItems = await tx
        .insert(invoiceItems)
        .values(
          recalculated.lines.map((line) => ({
            workspaceId,
            invoiceId: existing.id,
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
    }

    if (nonStatusChangedFields.length > 0) {
      await tx.insert(auditLogs).values({
        workspaceId,
        actorUserId: user.id,
        action: "update",
        entityType: "invoice",
        entityId: existing.id,
        before: {
          status: existing.status,
          total_amount: existing.totalAmount
        },
        after: {
          status: updated.status,
          total_amount: updated.totalAmount
        },
        metadata: {
          changed_fields: nonStatusChangedFields
        }
      });
    }

    if (statusChanged) {
      await tx.insert(auditLogs).values({
        workspaceId,
        actorUserId: user.id,
        action: "status_change",
        entityType: "invoice",
        entityId: existing.id,
        before: { status: existing.status },
        after: { status: updated.status },
        metadata: {
          changed_fields: ["status"],
          previous_status: existing.status,
          next_status: updated.status
        }
      });
    }

    return { invoice: updated, items: updatedItems };
  });
}
