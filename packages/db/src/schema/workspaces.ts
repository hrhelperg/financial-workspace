import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import {
  timestamps,
  workspaceInvitationStatusEnum,
  workspaceMemberRoleEnum,
  workspaceMemberStatusEnum
} from "./enums";
import { users } from "./users";

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

export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: workspaceMemberRoleEnum("role").default("member").notNull(),
    token: text("token").notNull(),
    status: workspaceInvitationStatusEnum("status").default("pending").notNull(),
    invitedById: uuid("invited_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    acceptedById: uuid("accepted_by_id").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => ({
    emailIdx: index("workspace_invitations_email_idx").on(table.email),
    statusExpiresAtIdx: index("workspace_invitations_status_expires_at_idx").on(table.status, table.expiresAt),
    tokenIdx: uniqueIndex("workspace_invitations_token_idx").on(table.token),
    workspaceIdx: index("workspace_invitations_workspace_id_idx").on(table.workspaceId),
    workspaceEmailIdx: index("workspace_invitations_workspace_email_idx").on(table.workspaceId, table.email)
  })
);

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;
