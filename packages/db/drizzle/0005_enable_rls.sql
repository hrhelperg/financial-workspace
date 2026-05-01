-- Phase 1: Row Level Security defense-in-depth.
-- App-layer isolation already enforces workspace boundaries; this migration adds
-- a database-side guarantee: even if a future query forgets a workspace_id filter,
-- Postgres will refuse to leak rows across tenants.
--
-- Identity propagation: the application sets a per-connection GUC
-- `app.current_user_id` from AsyncLocalStorage in IdentityPool (see
-- packages/db/src/client.ts). When the GUC is set, the connection switches
-- to the `authenticated` role, which is NOT BYPASSRLS. When it is empty
-- (bootstrap path: getCurrentUser, migrations), the role resets to the
-- pool's connecting role (Supabase `postgres`, BYPASSRLS), so this script
-- runs successfully on apply and future migrations are unaffected.

CREATE SCHEMA IF NOT EXISTS app;
--> statement-breakpoint

-- Ensure the `authenticated` role exists. Supabase ships it by default; this
-- guard makes the migration self-contained for non-Supabase deployments.
-- For non-Supabase deployments the operator must also `GRANT authenticated TO
-- <app_role>` so that IdentityPool's `SET ROLE authenticated` works at runtime.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;
--> statement-breakpoint

-- Identity helpers, isolated in the `app` schema.
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
  LANGUAGE sql STABLE AS
$$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION app.is_workspace_member(target_workspace_id uuid) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS
$$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = app.current_user_id()
      AND status = 'active'
  )
$$;
--> statement-breakpoint

-- Permissions for the authenticated role.
GRANT USAGE ON SCHEMA public TO authenticated;
--> statement-breakpoint
GRANT USAGE ON SCHEMA app TO authenticated;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app.current_user_id() TO authenticated;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app.is_workspace_member(uuid) TO authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
--> statement-breakpoint
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
--> statement-breakpoint

-- Workspaces: visible if you're a member; insertable if you'd be the owner;
-- updatable/deletable if you currently own it.
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY workspaces_select ON public.workspaces FOR SELECT TO authenticated
  USING (app.is_workspace_member(id));
--> statement-breakpoint
CREATE POLICY workspaces_insert ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = app.current_user_id());
--> statement-breakpoint
CREATE POLICY workspaces_update ON public.workspaces FOR UPDATE TO authenticated
  USING (owner_id = app.current_user_id())
  WITH CHECK (owner_id = app.current_user_id());
--> statement-breakpoint
CREATE POLICY workspaces_delete ON public.workspaces FOR DELETE TO authenticated
  USING (owner_id = app.current_user_id());
--> statement-breakpoint

-- Workspace members: split policies so a workspace owner can bootstrap their
-- own membership row even before they appear in workspace_members.
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY workspace_members_select ON public.workspace_members FOR SELECT TO authenticated
  USING (
    user_id = app.current_user_id()
    OR app.is_workspace_member(workspace_id)
  );
--> statement-breakpoint
CREATE POLICY workspace_members_insert ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (
    app.is_workspace_member(workspace_id)
    OR EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id AND w.owner_id = app.current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY workspace_members_update ON public.workspace_members FOR UPDATE TO authenticated
  USING (app.is_workspace_member(workspace_id))
  WITH CHECK (app.is_workspace_member(workspace_id));
--> statement-breakpoint
CREATE POLICY workspace_members_delete ON public.workspace_members FOR DELETE TO authenticated
  USING (app.is_workspace_member(workspace_id));
--> statement-breakpoint

-- Workspace invitations: accessible to existing members of the workspace.
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY workspace_invitations_member ON public.workspace_invitations FOR ALL TO authenticated
  USING (app.is_workspace_member(workspace_id))
  WITH CHECK (app.is_workspace_member(workspace_id));
--> statement-breakpoint

-- All remaining workspace-scoped tables share the same shape: a single
-- "you must be a workspace member" policy on every operation.
DO $$
DECLARE
  t text;
  workspace_tables text[] := ARRAY[
    'invoices',
    'invoice_items',
    'invoice_events',
    'invoice_idempotency_keys',
    'clients',
    'client_payment_profiles',
    'documents',
    'expenses',
    'expense_categories',
    'payments',
    'tasks',
    'notes',
    'cashflow_snapshots',
    'financial_insights',
    'audit_logs',
    'automation_rules',
    'automation_events',
    'events',
    'subscriptions'
  ];
BEGIN
  FOREACH t IN ARRAY workspace_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_member', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (app.is_workspace_member(workspace_id)) WITH CHECK (app.is_workspace_member(workspace_id))',
      t || '_member',
      t
    );
  END LOOP;
END $$;
