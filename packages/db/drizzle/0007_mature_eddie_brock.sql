CREATE TYPE "public"."template_category" AS ENUM('freelancer', 'small_business', 'agency', 'tax_export', 'forecast', 'other');--> statement-breakpoint
CREATE TYPE "public"."template_install_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."template_pricing_tier" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "public"."template_visibility" AS ENUM('draft', 'unlisted', 'public');--> statement-breakpoint
CREATE TABLE "template_installs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"template_version_id" uuid NOT NULL,
	"installed_by_user_id" uuid,
	"idempotency_key" text NOT NULL,
	"request_hash" text NOT NULL,
	"status" "template_install_status" DEFAULT 'pending' NOT NULL,
	"result" jsonb,
	"error" text,
	"installed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"config" jsonb NOT NULL,
	"changelog" text,
	"is_latest" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(200) NOT NULL,
	"tagline" varchar(280),
	"description" text,
	"category" "template_category" NOT NULL,
	"visibility" "template_visibility" DEFAULT 'draft' NOT NULL,
	"pricing_tier" "template_pricing_tier" DEFAULT 'free' NOT NULL,
	"icon_key" varchar(80),
	"hero_image_path" text,
	"seo_title" varchar(200),
	"seo_description" varchar(320),
	"seo_og_image_path" text,
	"created_by_user_id" uuid,
	"owner_workspace_id" uuid,
	"featured_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "template_installs" ADD CONSTRAINT "template_installs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_installs" ADD CONSTRAINT "template_installs_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_installs" ADD CONSTRAINT "template_installs_template_version_id_template_versions_id_fk" FOREIGN KEY ("template_version_id") REFERENCES "public"."template_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_installs" ADD CONSTRAINT "template_installs_installed_by_user_id_users_id_fk" FOREIGN KEY ("installed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_owner_workspace_id_workspaces_id_fk" FOREIGN KEY ("owner_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "template_installs_workspace_key_idx" ON "template_installs" USING btree ("workspace_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "template_installs_template_id_idx" ON "template_installs" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_installs_workspace_id_idx" ON "template_installs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "template_installs_status_idx" ON "template_installs" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "template_versions_template_version_idx" ON "template_versions" USING btree ("template_id","version");--> statement-breakpoint
CREATE INDEX "template_versions_template_is_latest_idx" ON "template_versions" USING btree ("template_id","is_latest");--> statement-breakpoint
CREATE UNIQUE INDEX "template_versions_one_latest_idx" ON "template_versions" USING btree ("template_id") WHERE "template_versions"."is_latest" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "templates_slug_idx" ON "templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "templates_category_idx" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "templates_visibility_idx" ON "templates" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "templates_featured_at_idx" ON "templates" USING btree ("featured_at");--> statement-breakpoint
CREATE INDEX "templates_owner_workspace_id_idx" ON "templates" USING btree ("owner_workspace_id");--> statement-breakpoint
CREATE INDEX "templates_deleted_at_idx" ON "templates" USING btree ("deleted_at");