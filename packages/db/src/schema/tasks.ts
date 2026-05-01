import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { emptyJson, relatedEntityTypeEnum, taskPriorityEnum, taskStatusEnum, timestamps } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type"),
    relatedEntityId: uuid("related_entity_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("todo").notNull(),
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    assignedToIdx: index("tasks_assigned_to_user_id_idx").on(table.assignedToUserId),
    dueAtIdx: index("tasks_due_at_idx").on(table.dueAt),
    relatedEntityIdx: index("tasks_related_entity_idx").on(table.relatedEntityType, table.relatedEntityId),
    statusIdx: index("tasks_status_idx").on(table.status),
    workspaceIdx: index("tasks_workspace_id_idx").on(table.workspaceId)
  })
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
