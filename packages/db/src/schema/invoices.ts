import { date, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { emptyJson, invoiceEventTypeEnum, invoiceStatusEnum, timestamps } from "./common";
import { users, workspaces } from "./identity";

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    invoiceNumber: varchar("invoice_number", { length: 80 }).notNull(),
    status: invoiceStatusEnum("status").default("draft").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
    discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).default("0").notNull(),
    taxTotal: numeric("tax_total", { precision: 12, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    notes: text("notes"),
    terms: text("terms"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    clientIdx: index("invoices_client_id_idx").on(table.clientId),
    dueDateIdx: index("invoices_due_date_idx").on(table.dueDate),
    statusIdx: index("invoices_status_idx").on(table.status),
    workspaceDueDateIdx: index("invoices_workspace_due_date_idx").on(table.workspaceId, table.dueDate),
    workspaceIdx: index("invoices_workspace_id_idx").on(table.workspaceId),
    workspaceInvoiceNumberIdx: uniqueIndex("invoices_workspace_invoice_number_idx").on(
      table.workspaceId,
      table.invoiceNumber
    ),
    workspaceStatusIdx: index("invoices_workspace_status_idx").on(table.workspaceId, table.status)
  })
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).default("1").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0").notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0").notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    lineTotal: numeric("line_total", { precision: 12, scale: 2 }).default("0").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    invoiceIdx: index("invoice_items_invoice_id_idx").on(table.invoiceId),
    workspaceIdx: index("invoice_items_workspace_id_idx").on(table.workspaceId)
  })
);

export const invoiceEvents = pgTable(
  "invoice_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: invoiceEventTypeEnum("event_type").notNull(),
    previousStatus: invoiceStatusEnum("previous_status"),
    nextStatus: invoiceStatusEnum("next_status"),
    message: text("message"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    actorIdx: index("invoice_events_actor_user_id_idx").on(table.actorUserId),
    invoiceIdx: index("invoice_events_invoice_id_idx").on(table.invoiceId),
    occurredAtIdx: index("invoice_events_occurred_at_idx").on(table.occurredAt),
    typeIdx: index("invoice_events_event_type_idx").on(table.eventType),
    workspaceIdx: index("invoice_events_workspace_id_idx").on(table.workspaceId)
  })
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type InvoiceEvent = typeof invoiceEvents.$inferSelect;
export type NewInvoiceEvent = typeof invoiceEvents.$inferInsert;
