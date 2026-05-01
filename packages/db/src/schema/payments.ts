import { date, index, numeric, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { emptyJson, paymentMethodEnum, paymentStatusEnum, timestamps } from "./common";
import { workspaces } from "./identity";
import { invoices } from "./invoices";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    method: paymentMethodEnum("method").default("bank_transfer").notNull(),
    status: paymentStatusEnum("status").default("completed").notNull(),
    paymentDate: date("payment_date").notNull(),
    externalId: varchar("external_id", { length: 255 }),
    processor: varchar("processor", { length: 80 }),
    notes: text("notes"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    clientIdx: index("payments_client_id_idx").on(table.clientId),
    externalIdx: index("payments_external_id_idx").on(table.externalId),
    invoiceIdx: index("payments_invoice_id_idx").on(table.invoiceId),
    paymentDateIdx: index("payments_payment_date_idx").on(table.paymentDate),
    statusIdx: index("payments_status_idx").on(table.status),
    workspaceIdx: index("payments_workspace_id_idx").on(table.workspaceId)
  })
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
