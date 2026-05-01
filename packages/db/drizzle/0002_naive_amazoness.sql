CREATE TYPE "public"."invoice_direction" AS ENUM('incoming', 'outgoing');--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "direction" "invoice_direction";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "fiscal_year" integer;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "storage_path" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "direction" "invoice_direction" DEFAULT 'incoming' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fiscal_year" integer;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "storage_path" text;--> statement-breakpoint
UPDATE "invoices" SET "fiscal_year" = extract(year from "issue_date")::integer WHERE "fiscal_year" IS NULL;--> statement-breakpoint
UPDATE "invoices"
SET "storage_path" = 'workspaces/' || "workspace_id"::text || '/fiscal/' || "fiscal_year"::text || '/' || "direction"::text || '/invoices/' || "id"::text || '.pdf'
WHERE "storage_path" IS NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "fiscal_year" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "documents_storage_path_idx" ON "documents" USING btree ("storage_path");--> statement-breakpoint
CREATE INDEX "documents_workspace_fiscal_direction_idx" ON "documents" USING btree ("workspace_id","fiscal_year","direction");--> statement-breakpoint
CREATE INDEX "invoices_direction_idx" ON "invoices" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "invoices_fiscal_year_idx" ON "invoices" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "invoices_workspace_direction_idx" ON "invoices" USING btree ("workspace_id","direction");--> statement-breakpoint
CREATE INDEX "invoices_workspace_fiscal_direction_idx" ON "invoices" USING btree ("workspace_id","fiscal_year","direction");
