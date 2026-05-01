import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import {
  automationActionEnum,
  automationEventStatusEnum,
  automationRuleStatusEnum,
  automationTriggerEnum,
  emptyJson,
  timestamps
} from "./common";
import { users, workspaces } from "./identity";

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
    status: automationRuleStatusEnum("status").default("active").notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    triggerConfig: emptyJson<Record<string, unknown>>("trigger_config"),
    actionConfig: emptyJson<Record<string, unknown>>("action_config"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps()
  },
  (table) => ({
    createdByIdx: index("automation_rules_created_by_id_idx").on(table.createdById),
    enabledIdx: index("automation_rules_is_enabled_idx").on(table.isEnabled),
    statusIdx: index("automation_rules_status_idx").on(table.status),
    triggerIdx: index("automation_rules_trigger_idx").on(table.trigger),
    workspaceIdx: index("automation_rules_workspace_id_idx").on(table.workspaceId)
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
    payload: emptyJson<Record<string, unknown>>("payload"),
    result: emptyJson<Record<string, unknown>>("result"),
    errorMessage: text("error_message"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    inngestEventId: varchar("inngest_event_id", { length: 255 }),
    inngestRunId: varchar("inngest_run_id", { length: 255 }),
    inngestFunctionId: varchar("inngest_function_id", { length: 255 }),
    ...timestamps()
  },
  (table) => ({
    inngestEventIdx: index("automation_events_inngest_event_id_idx").on(table.inngestEventId),
    ruleIdx: index("automation_events_rule_id_idx").on(table.ruleId),
    scheduledForIdx: index("automation_events_scheduled_for_idx").on(table.scheduledFor),
    statusIdx: index("automation_events_status_idx").on(table.status),
    workspaceIdx: index("automation_events_workspace_id_idx").on(table.workspaceId),
    workspaceScheduledIdx: index("automation_events_workspace_scheduled_idx").on(table.workspaceId, table.scheduledFor)
  })
);

export type AutomationRule = typeof automationRules.$inferSelect;
export type NewAutomationRule = typeof automationRules.$inferInsert;
export type AutomationEvent = typeof automationEvents.$inferSelect;
export type NewAutomationEvent = typeof automationEvents.$inferInsert;
