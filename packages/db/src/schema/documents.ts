import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import {
  documentStatusEnum,
  documentTypeEnum,
  emptyJson,
  eventStatusEnum,
  eventTypeEnum,
  relatedEntityTypeEnum,
  taskPriorityEnum,
  taskStatusEnum,
  timestamps
} from "./common";
import { users, workspaces } from "./identity";
import { invoices } from "./invoices";

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
    documentType: documentTypeEnum("document_type").default("other").notNull(),
    status: documentStatusEnum("status").default("uploaded").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 120 }).notNull(),
    storageKey: text("storage_key").notNull(),
    sizeBytes: integer("size_bytes"),
    checksum: varchar("checksum", { length: 255 }),
    parsedMetadata: emptyJson<Record<string, unknown>>("parsed_metadata"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    clientIdx: index("documents_client_id_idx").on(table.clientId),
    invoiceIdx: index("documents_invoice_id_idx").on(table.invoiceId),
    statusIdx: index("documents_status_idx").on(table.status),
    storageKeyIdx: index("documents_storage_key_idx").on(table.storageKey),
    typeIdx: index("documents_document_type_idx").on(table.documentType),
    uploadedByIdx: index("documents_uploaded_by_id_idx").on(table.uploadedById),
    workspaceIdx: index("documents_workspace_id_idx").on(table.workspaceId)
  })
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type").notNull(),
    relatedEntityId: uuid("related_entity_id").notNull(),
    body: text("body").notNull(),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    authorIdx: index("notes_author_user_id_idx").on(table.authorUserId),
    relatedEntityIdx: index("notes_related_entity_idx").on(table.relatedEntityType, table.relatedEntityId),
    workspaceIdx: index("notes_workspace_id_idx").on(table.workspaceId)
  })
);

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

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: eventTypeEnum("event_type").notNull(),
    status: eventStatusEnum("status").default("completed").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type"),
    relatedEntityId: uuid("related_entity_id"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    actorIdx: index("events_actor_user_id_idx").on(table.actorUserId),
    occurredAtIdx: index("events_occurred_at_idx").on(table.occurredAt),
    relatedEntityIdx: index("events_related_entity_idx").on(table.relatedEntityType, table.relatedEntityId),
    scheduledAtIdx: index("events_scheduled_at_idx").on(table.scheduledAt),
    typeIdx: index("events_event_type_idx").on(table.eventType),
    workspaceIdx: index("events_workspace_id_idx").on(table.workspaceId)
  })
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
