# Financial Workspace

Financial Workspace is a structured financial operations workspace for freelancers and small businesses.

It helps users manage invoices, expenses, clients, cashflow, documents, payment reminders, and automation in one place. The goal is not to build another invoice tool, but a system that helps small operators get paid faster, understand cashflow, and organize financial operations.

This is a TypeScript monorepo with a Next.js web app, Tailwind CSS UI, Drizzle ORM database schema, and an Inngest-ready automation surface.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Inngest-ready automation foundation
- Future integrations: Postmark and Cloudflare R2

## Apps and packages

- `apps/web`: Next.js App Router application with dashboard routes and placeholder workspace UI.
- `packages/db`: Drizzle ORM package with the initial PostgreSQL schema and database client factory.
- `packages/ui`: Shared React UI primitives for the workspace interface.
- `packages/core`: Shared product constants, route metadata, and workspace domain data.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The web app runs at [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:check
npm run db:push
npm run db:studio
```

## Routes

- `/dashboard`
- `/clients`
- `/invoices`
- `/expenses`
- `/cashflow`
- `/documents`
- `/documents/export`
- `/settings`
- `/settings/team`
- `/settings/team/invite`
- `/login`

## Product areas

- Dashboard for the current financial operating picture.
- Clients for billing relationships and account context.
- Invoices and payments for receivables and getting paid faster.
- Expenses for spend tracking and receipt organization.
- Cashflow for short-term inflow, outflow, and risk visibility.
- Documents for contracts, receipts, invoices, fiscal folders, and financial records.
- Automation rules and events for future workflow orchestration.

## Current MVP

- Clients list with a create client form.
- Invoices list with a create invoice form.
- Itemized invoice lines with quantity, unit price, tax rate, and calculated totals.
- Invoice statuses: `draft`, `sent`, `paid`, `overdue`, `cancelled`.
- Invoice directions: `incoming` for sales invoices and `outgoing` for purchase invoices.
- Fiscal export metadata grouped by year and invoice direction.
- Fiscal ZIP export at `/api/export?year=2026` with `incoming/`, `outgoing/`, and `summary.csv`.
- Dashboard summary cards for clients, open invoices, receivables, and overdue balance.

## Database

The Drizzle schema lives in `packages/db/src/schema` and is split by domain. It currently defines:

- `users`
- `workspaces`
- `workspace_members`
- `workspace_invitations`
- `clients`
- `client_payment_profiles`
- `invoices`
- `invoice_items`
- `invoice_events`
- `payments`
- `expense_categories`
- `expenses`
- `cashflow_snapshots`
- `financial_insights`
- `documents`
- `notes`
- `tasks`
- `automation_rules`
- `automation_events`
- `events`
- `audit_logs`
- `subscriptions`

The schema files live under `packages/db/src/schema`:

- `enums.ts`
- `users.ts`
- `workspaces.ts`
- `clients.ts`
- `invoices.ts`
- `payments.ts`
- `expenses.ts`
- `cashflow.ts`
- `documents.ts`
- `notes.ts`
- `tasks.ts`
- `automation.ts`
- `events.ts`
- `audit.ts`
- `billing.ts`

Set `DATABASE_URL` in `.env` before running Drizzle commands. The `.env.example` file intentionally uses empty placeholders so real local or Supabase credentials are never committed. Make sure Node.js and npm are installed before running the package scripts.

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgres://financial_workspace:financial_workspace@localhost:5432/financial_workspace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
FISCAL_DOCUMENT_STORAGE_ROOT=""
```

For Supabase, use the project connection string from Supabase Database settings as `DATABASE_URL`. Use the direct connection string for migrations when possible, or the pooled connection string if your environment requires it.

Install dependencies before running validation or migration commands:

```bash
npm install
```

Generate SQL migrations from the schema:

```bash
npm run db:generate
```

Check generated migrations against the schema:

```bash
npm run db:check
```

Run migrations against the configured database:

```bash
npm run db:migrate
```

For local PostgreSQL, this applies the generated SQL files to the database in `.env`. For Supabase, set `DATABASE_URL` to the Supabase connection string, then run the same command. As an alternative for Supabase, inspect the generated SQL under `packages/db/drizzle` and apply it in the Supabase SQL editor.

Open Drizzle Studio:

```bash
npm run db:studio
```

`db:push` is available only for local development and prototyping. Use generated migrations for shared, staging, and production databases.

## Authentication and security

Supabase Auth is used for authentication when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured. The app maps Supabase Auth users to local `users` records and grants access through `workspace_members`.

Required local environment values:

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
FISCAL_DOCUMENT_STORAGE_ROOT=
```

Never expose Supabase service-role keys in the web app. Service-role keys must not be committed, must not use the `NEXT_PUBLIC_` prefix, and should only be used from trusted backend jobs if they are added later.

Workspace data is tenant-isolated by `workspace_id`. Server helpers require active membership before loading workspace data, and write operations require an appropriate workspace role.

Team invitations are stored in `workspace_invitations` with a token, role, status, and expiration. Email sending is currently abstracted so a provider can be added later without changing invitation persistence.

Tenant isolation rules:

- The current workspace is derived on the server from the authenticated user through `getCurrentWorkspace()`.
- Client requests must never provide a trusted `workspace_id`; reads and writes use the workspace from `requireWorkspaceMember()` or `requireWorkspaceRole()`.
- Workspace business data queries must include a `workspace_id` filter before returning clients, invoices, expenses, documents, dashboard metrics, or related records.
- Invite tokens are only viewable and acceptable by the signed-in user whose email matches the pending, unexpired invitation.
- Supabase service-role keys must stay server-only and must not be added to `NEXT_PUBLIC_` variables.

Tenant security test cases:

- User A in workspace A cannot load a client, invoice, expense, or document from workspace B by guessing an ID.
- User A cannot create an invoice in workspace A with a client ID from workspace B.
- A viewer cannot create clients, invoices, or invitations.
- A member can create clients and invoices but cannot invite teammates.
- An admin can invite teammates as `admin`, `member`, or `viewer`, but cannot grant ownership by invitation.
- An invitation token cannot be viewed or accepted by a signed-in user with a different email address.

Recommended Supabase hardening: add Row Level Security policies that mirror the app-level membership checks before exposing any direct database access outside trusted server code.

## Automation

The web app includes an Inngest client at `apps/web/src/inngest/client.ts`, a placeholder function at `apps/web/src/inngest/functions.ts`, and the API handler at `apps/web/src/app/api/inngest/route.ts`.

The database schema includes `automation_rules` and `automation_events` with Inngest event/run/function identifiers reserved for future workflow orchestration.
