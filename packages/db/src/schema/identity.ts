import { index, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps, workspaceMemberRoleEnum, workspaceMemberStatusEnum } from "./common";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    imageUrl: text("image_url"),
    ...timestamps()
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    billingEmail: varchar("billing_email", { length: 255 }),
    baseCurrency: varchar("base_currency", { length: 3 }).default("USD").notNull(),
    ...timestamps()
  },
  (table) => ({
    ownerIdx: index("workspaces_owner_id_idx").on(table.ownerId),
    slugIdx: uniqueIndex("workspaces_slug_idx").on(table.slug)
  })
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: workspaceMemberRoleEnum("role").default("member").notNull(),
    status: workspaceMemberStatusEnum("status").default("invited").notNull(),
    invitedById: uuid("invited_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps()
  },
  (table) => ({
    userIdx: index("workspace_members_user_id_idx").on(table.userId),
    workspaceIdx: index("workspace_members_workspace_id_idx").on(table.workspaceId),
    workspaceUserIdx: uniqueIndex("workspace_members_workspace_user_idx").on(table.workspaceId, table.userId)
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;
