import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { emptyJson, eventStatusEnum, eventTypeEnum, relatedEntityTypeEnum, timestamps } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    type: eventTypeEnum("type").notNull(),
    status: eventStatusEnum("status").default("completed").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    entityType: relatedEntityTypeEnum("entity_type"),
    entityId: uuid("entity_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    actorIdx: index("events_actor_user_id_idx").on(table.actorUserId),
    entityIdx: index("events_entity_idx").on(table.entityType, table.entityId),
    occurredAtIdx: index("events_occurred_at_idx").on(table.occurredAt),
    scheduledAtIdx: index("events_scheduled_at_idx").on(table.scheduledAt),
    typeIdx: index("events_type_idx").on(table.type),
    workspaceIdx: index("events_workspace_id_idx").on(table.workspaceId),
    workspaceTypeIdx: index("events_workspace_type_idx").on(table.workspaceId, table.type)
  })
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
