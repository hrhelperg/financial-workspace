CREATE TABLE "financial_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"expected_income" numeric(12, 2) DEFAULT '0' NOT NULL,
	"expected_expenses" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "financial_forecasts" ADD CONSTRAINT "financial_forecasts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "financial_forecasts_workspace_id_idx" ON "financial_forecasts" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "financial_forecasts_workspace_year_idx" ON "financial_forecasts" USING btree ("workspace_id","year");--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.financial_forecasts TO authenticated;--> statement-breakpoint
ALTER TABLE public.financial_forecasts ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS financial_forecasts_member ON public.financial_forecasts;--> statement-breakpoint
CREATE POLICY financial_forecasts_member ON public.financial_forecasts FOR ALL TO authenticated
  USING (app.is_workspace_member(workspace_id))
  WITH CHECK (app.is_workspace_member(workspace_id));
