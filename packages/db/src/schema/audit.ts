import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { auditActionEnum, emptyJson } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 120 }).notNull(),
    entityId: uuid("entity_id"),
    before: emptyJson<Record<string, unknown>>("before"),
    after: emptyJson<Record<string, unknown>>("after"),
    ipAddress: varchar("ip_address", { length: 80 }),
    userAgent: text("user_agent"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    actionIdx: index("audit_logs_action_idx").on(table.action),
    actorIdx: index("audit_logs_actor_user_id_idx").on(table.actorUserId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    workspaceIdx: index("audit_logs_workspace_id_idx").on(table.workspaceId)
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
