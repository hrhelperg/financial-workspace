import { index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { clientStatusEnum, emptyJson, paymentRiskLevelEnum, timestamps } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

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
    status: clientStatusEnum("status").default("active").notNull(),
    notes: text("notes"),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => ({
    deletedAtIdx: index("clients_deleted_at_idx").on(table.deletedAt),
    emailIdx: index("clients_email_idx").on(table.email),
    ownerIdx: index("clients_owner_user_id_idx").on(table.ownerUserId),
    statusIdx: index("clients_status_idx").on(table.status),
    workspaceIdx: index("clients_workspace_id_idx").on(table.workspaceId)
  })
);

export const clientPaymentProfiles = pgTable(
  "client_payment_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    defaultPaymentTermsDays: integer("default_payment_terms_days").default(14).notNull(),
    preferredPaymentMethod: varchar("preferred_payment_method", { length: 80 }),
    reminderCadence: varchar("reminder_cadence", { length: 80 }).default("standard").notNull(),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }),
    paymentRiskLevel: paymentRiskLevelEnum("payment_risk_level").default("unknown").notNull(),
    paymentRiskScore: numeric("payment_risk_score", { precision: 5, scale: 2 }),
    averageDaysToPay: numeric("average_days_to_pay", { precision: 7, scale: 2 }),
    latePaymentCount: integer("late_payment_count").default(0).notNull(),
    riskModelVersion: varchar("risk_model_version", { length: 80 }),
    riskFactors: emptyJson<Record<string, unknown>>("risk_factors"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    clientIdx: index("client_payment_profiles_client_id_idx").on(table.clientId),
    riskIdx: index("client_payment_profiles_payment_risk_level_idx").on(table.paymentRiskLevel),
    workspaceClientIdx: uniqueIndex("client_payment_profiles_workspace_client_idx").on(
      table.workspaceId,
      table.clientId
    ),
    workspaceIdx: index("client_payment_profiles_workspace_id_idx").on(table.workspaceId)
  })
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientPaymentProfile = typeof clientPaymentProfiles.$inferSelect;
export type NewClientPaymentProfile = typeof clientPaymentProfiles.$inferInsert;
