import { date, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { emptyJson, subscriptionPlanEnum, subscriptionStatusEnum, timestamps } from "./enums";
import { workspaces } from "./workspaces";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    plan: subscriptionPlanEnum("plan").default("free").notNull(),
    status: subscriptionStatusEnum("status").default("trialing").notNull(),
    provider: varchar("provider", { length: 80 }),
    providerCustomerId: varchar("provider_customer_id", { length: 255 }),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
    currentPeriodStart: date("current_period_start"),
    currentPeriodEnd: date("current_period_end"),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    providerCustomerIdx: index("subscriptions_provider_customer_id_idx").on(table.providerCustomerId),
    providerSubscriptionIdx: uniqueIndex("subscriptions_provider_subscription_id_idx").on(
      table.providerSubscriptionId
    ),
    statusIdx: index("subscriptions_status_idx").on(table.status),
    workspaceIdx: index("subscriptions_workspace_id_idx").on(table.workspaceId)
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
