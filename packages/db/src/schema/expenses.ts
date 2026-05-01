import { sql } from "drizzle-orm";
import { check, date, index, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { emptyJson, expenseCategoryTypeEnum, expenseStatusEnum, timestamps } from "./enums";
import { documents } from "./documents";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    type: expenseCategoryTypeEnum("type").default("operating").notNull(),
    description: text("description"),
    taxCode: varchar("tax_code", { length: 80 }),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    typeIdx: index("expense_categories_type_idx").on(table.type),
    workspaceIdx: index("expense_categories_workspace_id_idx").on(table.workspaceId),
    workspaceNameIdx: uniqueIndex("expense_categories_workspace_name_idx").on(table.workspaceId, table.name)
  })
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => expenseCategories.id, { onDelete: "set null" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    submittedByUserId: uuid("submitted_by_user_id").references(() => users.id, { onDelete: "set null" }),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, { onDelete: "set null" }),
    receiptDocumentId: uuid("receipt_document_id").references(() => documents.id, { onDelete: "set null" }),
    vendor: varchar("vendor", { length: 255 }).notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    reimbursableAmount: numeric("reimbursable_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    expenseDate: date("expense_date").notNull(),
    status: expenseStatusEnum("status").default("draft").notNull(),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => ({
    amountPositiveCheck: check("expenses_amount_positive", sql`${table.amount} > 0`),
    categoryIdx: index("expenses_category_id_idx").on(table.categoryId),
    deletedAtIdx: index("expenses_deleted_at_idx").on(table.deletedAt),
    clientIdx: index("expenses_client_id_idx").on(table.clientId),
    dateIdx: index("expenses_expense_date_idx").on(table.expenseDate),
    receiptDocumentIdx: index("expenses_receipt_document_id_idx").on(table.receiptDocumentId),
    statusIdx: index("expenses_status_idx").on(table.status),
    workspaceDateIdx: index("expenses_workspace_expense_date_idx").on(table.workspaceId, table.expenseDate),
    workspaceIdx: index("expenses_workspace_id_idx").on(table.workspaceId)
  })
);

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type NewExpenseCategory = typeof expenseCategories.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
