import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { emptyJson, relatedEntityTypeEnum, timestamps } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

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

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
