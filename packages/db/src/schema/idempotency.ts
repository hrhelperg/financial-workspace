import { index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const invoiceIdempotencyKeys = pgTable(
  "invoice_idempotency_keys",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    requestHash: text("request_hash").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceId, table.key] }),
    invoiceIdx: index("invoice_idempotency_keys_invoice_id_idx").on(table.invoiceId)
  })
);

export type InvoiceIdempotencyKey = typeof invoiceIdempotencyKeys.$inferSelect;
export type NewInvoiceIdempotencyKey = typeof invoiceIdempotencyKeys.$inferInsert;
