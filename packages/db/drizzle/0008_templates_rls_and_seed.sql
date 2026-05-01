-- Phase 3a: templates RLS + seed the first public template (Freelancer Finance Dashboard).
--
-- Templates and template_versions are GLOBAL tables (no workspace_id) so they
-- can be browsed by every workspace. The policies below permit authenticated
-- users to read public, non-deleted templates and their published versions;
-- mutations are reserved for the creator user or owner-workspace members.
-- Phase 3a does not yet support user-owned templates, so in practice mutations
-- are only performed by migrations running as the BYPASSRLS connecting role.
--
-- template_installs is workspace-scoped; standard "must be a member" policy.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.templates TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.template_versions TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.template_installs TO authenticated;
--> statement-breakpoint

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS templates_public_read ON public.templates;
--> statement-breakpoint
CREATE POLICY templates_public_read ON public.templates FOR SELECT TO authenticated
  USING (visibility = 'public' AND deleted_at IS NULL);
--> statement-breakpoint
DROP POLICY IF EXISTS templates_owner_read ON public.templates;
--> statement-breakpoint
CREATE POLICY templates_owner_read ON public.templates FOR SELECT TO authenticated
  USING (
    created_by_user_id = app.current_user_id()
    OR (owner_workspace_id IS NOT NULL AND app.is_workspace_member(owner_workspace_id))
  );
--> statement-breakpoint
DROP POLICY IF EXISTS templates_owner_mutate ON public.templates;
--> statement-breakpoint
CREATE POLICY templates_owner_mutate ON public.templates FOR ALL TO authenticated
  USING (
    created_by_user_id = app.current_user_id()
    OR (owner_workspace_id IS NOT NULL AND app.is_workspace_member(owner_workspace_id))
  )
  WITH CHECK (
    created_by_user_id = app.current_user_id()
    OR (owner_workspace_id IS NOT NULL AND app.is_workspace_member(owner_workspace_id))
  );
--> statement-breakpoint

ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS template_versions_read ON public.template_versions;
--> statement-breakpoint
CREATE POLICY template_versions_read ON public.template_versions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t
      WHERE t.id = template_versions.template_id
        AND t.deleted_at IS NULL
        AND (
          t.visibility = 'public'
          OR t.created_by_user_id = app.current_user_id()
          OR (t.owner_workspace_id IS NOT NULL AND app.is_workspace_member(t.owner_workspace_id))
        )
    )
  );
--> statement-breakpoint
DROP POLICY IF EXISTS template_versions_mutate ON public.template_versions;
--> statement-breakpoint
CREATE POLICY template_versions_mutate ON public.template_versions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t
      WHERE t.id = template_versions.template_id
        AND (
          t.created_by_user_id = app.current_user_id()
          OR (t.owner_workspace_id IS NOT NULL AND app.is_workspace_member(t.owner_workspace_id))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.templates t
      WHERE t.id = template_versions.template_id
        AND (
          t.created_by_user_id = app.current_user_id()
          OR (t.owner_workspace_id IS NOT NULL AND app.is_workspace_member(t.owner_workspace_id))
        )
    )
  );
--> statement-breakpoint

ALTER TABLE public.template_installs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS template_installs_member ON public.template_installs;
--> statement-breakpoint
CREATE POLICY template_installs_member ON public.template_installs FOR ALL TO authenticated
  USING (app.is_workspace_member(workspace_id))
  WITH CHECK (app.is_workspace_member(workspace_id));
--> statement-breakpoint

-- Seed: Freelancer Finance Dashboard. Idempotent via slug uniqueness.
INSERT INTO public.templates (
  slug, name, tagline, description, category, visibility, pricing_tier,
  icon_key, seo_title, seo_description, published_at
) VALUES (
  'freelancer-finance-dashboard',
  'Freelancer Finance Dashboard',
  $tagline$Track income, expenses, and runway in one place — built for solo operators.$tagline$,
  $desc$A complete financial workspace for freelancers: client roster, incoming invoices, deductible expenses, a year-end tax folder, and a 12-month runway forecast. Replaces five spreadsheets and a shoebox.$desc$,
  'freelancer',
  'public',
  'free',
  'freelancer',
  'Free Freelancer Finance Template — Invoices, Expenses, Forecast',
  'Free template for freelancers: client list, invoice tracking, deductible expense categories, tax folder, and a 12-month cash forecast. One click to install.',
  now()
)
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint

INSERT INTO public.template_versions (template_id, version, config, changelog, is_latest, published_at)
SELECT t.id, 1,
  $json${
    "schemaVersion": 1,
    "workspace": {
      "namePattern": "{{user.firstName}}'s freelance finances",
      "slugPattern": "{{user.id|first8}}-freelance",
      "baseCurrency": "USD"
    },
    "expenseCategories": [
      { "name": "Software & SaaS", "type": "operating", "description": "Tools, subscriptions, hosting" },
      { "name": "Equipment", "type": "operating", "description": "Hardware, peripherals, depreciable assets" },
      { "name": "Professional services", "type": "operating", "description": "Accountant, lawyer, contractor" },
      { "name": "Travel", "type": "operating", "description": "Flights, lodging, transit for client work" },
      { "name": "Meals & entertainment", "type": "operating", "description": "Client meetings, conferences" },
      { "name": "Office", "type": "operating", "description": "Coworking, home-office portion" },
      { "name": "Marketing", "type": "operating", "description": "Ads, website, portfolio" },
      { "name": "Self-employment tax", "type": "tax", "taxCode": "SE" },
      { "name": "Income tax estimated", "type": "tax", "taxCode": "EST" }
    ],
    "documentFolders": [
      { "pathTemplate": "documents/incoming/{{year}}", "description": "Invoices you sent clients" },
      { "pathTemplate": "documents/outgoing/{{year}}", "description": "Bills and receipts you paid" },
      { "pathTemplate": "documents/tax/{{year}}", "description": "1099s, W-9s, year-end summaries", "yearsBack": 1 },
      { "pathTemplate": "documents/contracts", "description": "Active and archived client agreements" }
    ],
    "forecast": {
      "horizonMonths": 12,
      "expectedMonthlyIncome": 0,
      "expectedMonthlyExpenses": 0
    },
    "dashboard": {
      "widgets": [
        { "key": "incoming_total_ytd", "size": "md", "order": 0 },
        { "key": "outgoing_total_ytd", "size": "md", "order": 1 },
        { "key": "net_ytd", "size": "md", "order": 2 },
        { "key": "runway_months", "size": "md", "order": 3 },
        { "key": "outstanding_invoices", "size": "lg", "order": 4 },
        { "key": "upcoming_tax_dates", "size": "md", "order": 5 }
      ]
    },
    "invoiceDefaults": {
      "direction": "incoming",
      "paymentTermsDays": 14,
      "currency": "USD"
    }
  }$json$::jsonb,
  'Initial version.',
  true,
  now()
FROM public.templates t
WHERE t.slug = 'freelancer-finance-dashboard'
  AND NOT EXISTS (
    SELECT 1 FROM public.template_versions v WHERE v.template_id = t.id AND v.version = 1
  );
