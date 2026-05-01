import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const invoiceStatusValues = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

export const invoiceStatusEnum = pgEnum("invoice_status", invoiceStatusValues);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["bank_transfer", "card", "cash", "check", "other"]);
export const expenseStatusEnum = pgEnum("expense_status", ["draft", "submitted", "approved", "rejected", "paid"]);
export const documentStatusEnum = pgEnum("document_status", ["uploaded", "processing", "ready", "archived"]);
export const automationTriggerEnum = pgEnum("automation_trigger", [
  "invoice_created",
  "invoice_overdue",
  "payment_received",
  "expense_created",
  "document_uploaded",
  "client_created"
]);
export const automationActionEnum = pgEnum("automation_action", [
  "send_email",
  "create_task",
  "send_webhook",
  "tag_record",
  "notify_workspace"
]);
export const automationEventStatusEnum = pgEnum("automation_event_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "skipped"
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    imageUrl: text("image_url"),
    ...timestamps()
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    billingEmail: varchar("billing_email", { length: 255 }),
    baseCurrency: varchar("base_currency", { length: 3 }).default("USD").notNull(),
    ...timestamps()
  },
  (table) => ({
    slugIdx: uniqueIndex("workspaces_slug_idx").on(table.slug),
    ownerIdx: index("workspaces_owner_id_idx").on(table.ownerId)
  })
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    companyName: varchar("company_name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 80 }),
    taxId: varchar("tax_id", { length: 120 }),
    addressLine1: varchar("address_line_1", { length: 255 }),
    addressLine2: varchar("address_line_2", { length: 255 }),
    city: varchar("city", { length: 120 }),
    region: varchar("region", { length: 120 }),
    postalCode: varchar("postal_code", { length: 40 }),
    country: varchar("country", { length: 120 }),
    notes: text("notes"),
    ...timestamps()
  },
  (table) => ({
    workspaceIdx: index("clients_workspace_id_idx").on(table.workspaceId),
    emailIdx: index("clients_email_idx").on(table.email)
  })
);

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
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
    discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).default("0").notNull(),
    taxTotal: numeric("tax_total", { precision: 12, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    notes: text("notes"),
    terms: text("terms"),
    ...timestamps()
  },
  (table) => ({
    workspaceIdx: index("invoices_workspace_id_idx").on(table.workspaceId),
    clientIdx: index("invoices_client_id_idx").on(table.clientId),
    statusIdx: index("invoices_status_idx").on(table.status),
    invoiceNumberIdx: uniqueIndex("invoices_workspace_invoice_number_idx").on(
      table.workspaceId,
      table.invoiceNumber
    )
  })
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).default("1").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0").notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0").notNull(),
    lineTotal: numeric("line_total", { precision: 12, scale: 2 }).default("0").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps()
  },
  (table) => ({
    invoiceIdx: index("invoice_items_invoice_id_idx").on(table.invoiceId)
  })
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    method: paymentMethodEnum("method").default("bank_transfer").notNull(),
    status: paymentStatusEnum("status").default("completed").notNull(),
    paymentDate: date("payment_date").notNull(),
    externalId: varchar("external_id", { length: 255 }),
    notes: text("notes"),
    ...timestamps()
  },
  (table) => ({
    workspaceIdx: index("payments_workspace_id_idx").on(table.workspaceId),
    invoiceIdx: index("payments_invoice_id_idx").on(table.invoiceId),
    externalIdx: index("payments_external_id_idx").on(table.externalId)
  })
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 120 }).notNull(),
    storageKey: text("storage_key").notNull(),
    sizeBytes: integer("size_bytes"),
    status: documentStatusEnum("status").default("uploaded").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    ...timestamps()
  },
  (table) => ({
    workspaceIdx: index("documents_workspace_id_idx").on(table.workspaceId),
    clientIdx: index("documents_client_id_idx").on(table.clientId),
    invoiceIdx: index("documents_invoice_id_idx").on(table.invoiceId),
    storageKeyIdx: uniqueIndex("documents_storage_key_idx").on(table.storageKey)
  })
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    vendor: varchar("vendor", { length: 255 }).notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    expenseDate: date("expense_date").notNull(),
    status: expenseStatusEnum("status").default("draft").notNull(),
    receiptDocumentId: uuid("receipt_document_id").references(() => documents.id, { onDelete: "set null" }),
    ...timestamps()
  },
  (table) => ({
    workspaceIdx: index("expenses_workspace_id_idx").on(table.workspaceId),
    dateIdx: index("expenses_expense_date_idx").on(table.expenseDate),
    receiptDocumentIdx: index("expenses_receipt_document_id_idx").on(table.receiptDocumentId)
  })
);

export const automationRules = pgTable(
  "automation_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    trigger: automationTriggerEnum("trigger").notNull(),
    action: automationActionEnum("action").notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps()
  },
  (table) => ({
    workspaceIdx: index("automation_rules_workspace_id_idx").on(table.workspaceId),
    enabledIdx: index("automation_rules_is_enabled_idx").on(table.isEnabled)
  })
);

export const automationEvents = pgTable(
  "automation_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    ruleId: uuid("rule_id").references(() => automationRules.id, { onDelete: "set null" }),
    eventName: varchar("event_name", { length: 160 }).notNull(),
    status: automationEventStatusEnum("status").default("queued").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    errorMessage: text("error_message"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    inngestEventId: varchar("inngest_event_id", { length: 255 }),
    inngestRunId: varchar("inngest_run_id", { length: 255 }),
    inngestFunctionId: varchar("inngest_function_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    workspaceIdx: index("automation_events_workspace_id_idx").on(table.workspaceId),
    ruleIdx: index("automation_events_rule_id_idx").on(table.ruleId),
    statusIdx: index("automation_events_status_idx").on(table.status),
    inngestEventIdx: index("automation_events_inngest_event_id_idx").on(table.inngestEventId)
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  uploadedDocuments: many(documents),
  automationRules: many(automationRules)
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id]
  }),
  clients: many(clients),
  invoices: many(invoices),
  payments: many(payments),
  expenses: many(expenses),
  documents: many(documents),
  automationRules: many(automationRules),
  automationEvents: many(automationEvents)
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id]
  }),
  invoices: many(invoices),
  documents: many(documents)
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [invoices.workspaceId],
    references: [workspaces.id]
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id]
  }),
  items: many(invoiceItems),
  payments: many(payments),
  documents: many(documents)
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [payments.workspaceId],
    references: [workspaces.id]
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id]
  })
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [documents.workspaceId],
    references: [workspaces.id]
  }),
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id]
  }),
  invoice: one(invoices, {
    fields: [documents.invoiceId],
    references: [invoices.id]
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id]
  }),
  expenses: many(expenses)
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [expenses.workspaceId],
    references: [workspaces.id]
  }),
  receiptDocument: one(documents, {
    fields: [expenses.receiptDocumentId],
    references: [documents.id]
  })
}));

export const automationRulesRelations = relations(automationRules, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [automationRules.workspaceId],
    references: [workspaces.id]
  }),
  createdBy: one(users, {
    fields: [automationRules.createdById],
    references: [users.id]
  }),
  events: many(automationEvents)
}));

export const automationEventsRelations = relations(automationEvents, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [automationEvents.workspaceId],
    references: [workspaces.id]
  }),
  rule: one(automationRules, {
    fields: [automationEvents.ruleId],
    references: [automationRules.id]
  })
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type AutomationRule = typeof automationRules.$inferSelect;
export type NewAutomationRule = typeof automationRules.$inferInsert;
export type AutomationEvent = typeof automationEvents.$inferSelect;
export type NewAutomationEvent = typeof automationEvents.$inferInsert;
