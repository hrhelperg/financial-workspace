import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { timestamps } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const templateCategoryEnum = pgEnum("template_category", [
  "freelancer",
  "small_business",
  "agency",
  "tax_export",
  "forecast",
  "other"
]);

export const templateVisibilityEnum = pgEnum("template_visibility", [
  "draft",
  "unlisted",
  "public"
]);

export const templatePricingTierEnum = pgEnum("template_pricing_tier", [
  "free",
  "premium"
]);

export const templateInstallStatusEnum = pgEnum("template_install_status", [
  "pending",
  "completed",
  "failed"
]);

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    tagline: varchar("tagline", { length: 280 }),
    description: text("description"),
    category: templateCategoryEnum("category").notNull(),
    visibility: templateVisibilityEnum("visibility").default("draft").notNull(),
    pricingTier: templatePricingTierEnum("pricing_tier").default("free").notNull(),
    iconKey: varchar("icon_key", { length: 80 }),
    heroImagePath: text("hero_image_path"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    seoOgImagePath: text("seo_og_image_path"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    ownerWorkspaceId: uuid("owner_workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
    featuredAt: timestamp("featured_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => ({
    slugIdx: uniqueIndex("templates_slug_idx").on(table.slug),
    categoryIdx: index("templates_category_idx").on(table.category),
    visibilityIdx: index("templates_visibility_idx").on(table.visibility),
    featuredIdx: index("templates_featured_at_idx").on(table.featuredAt),
    ownerWorkspaceIdx: index("templates_owner_workspace_id_idx").on(table.ownerWorkspaceId),
    deletedAtIdx: index("templates_deleted_at_idx").on(table.deletedAt)
  })
);

export const templateVersions = pgTable(
  "template_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    config: jsonb("config").notNull(),
    changelog: text("changelog"),
    isLatest: boolean("is_latest").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => ({
    templateVersionIdx: uniqueIndex("template_versions_template_version_idx").on(
      table.templateId,
      table.version
    ),
    latestIdx: index("template_versions_template_is_latest_idx").on(table.templateId, table.isLatest),
    onlyOneLatest: uniqueIndex("template_versions_one_latest_idx")
      .on(table.templateId)
      .where(sql`${table.isLatest} = true`)
  })
);

export const templateInstalls = pgTable(
  "template_installs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "restrict" }),
    templateVersionId: uuid("template_version_id")
      .notNull()
      .references(() => templateVersions.id, { onDelete: "restrict" }),
    installedByUserId: uuid("installed_by_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    idempotencyKey: text("idempotency_key").notNull(),
    requestHash: text("request_hash").notNull(),
    status: templateInstallStatusEnum("status").default("pending").notNull(),
    result: jsonb("result"),
    error: text("error"),
    installedAt: timestamp("installed_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => ({
    workspaceKeyIdx: uniqueIndex("template_installs_workspace_key_idx").on(
      table.workspaceId,
      table.idempotencyKey
    ),
    templateIdx: index("template_installs_template_id_idx").on(table.templateId),
    workspaceIdx: index("template_installs_workspace_id_idx").on(table.workspaceId),
    statusIdx: index("template_installs_status_idx").on(table.status)
  })
);

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type TemplateVersion = typeof templateVersions.$inferSelect;
export type NewTemplateVersion = typeof templateVersions.$inferInsert;
export type TemplateInstall = typeof templateInstalls.$inferSelect;
export type NewTemplateInstall = typeof templateInstalls.$inferInsert;
