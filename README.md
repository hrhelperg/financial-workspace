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
- `/settings`

## Product areas

- Dashboard for the current financial operating picture.
- Clients for billing relationships and account context.
- Invoices and payments for receivables and getting paid faster.
- Expenses for spend tracking and receipt organization.
- Cashflow for short-term inflow, outflow, and risk visibility.
- Documents for contracts, receipts, invoices, and financial records.
- Automation rules and events for future workflow orchestration.

## Current MVP

- Clients list with a create client form.
- Invoices list with a create invoice form.
- Itemized invoice lines with quantity, unit price, tax rate, and calculated totals.
- Invoice statuses: `draft`, `sent`, `paid`, `overdue`, `cancelled`.
- Dashboard summary cards for clients, open invoices, receivables, and overdue balance.

## Database

The Drizzle schema lives in `packages/db/src/schema` and is split by domain. It currently defines:

- `users`
- `workspaces`
- `workspace_members`
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

Set `DATABASE_URL` in `.env` before running Drizzle commands. The default `.env.example` assumes a local PostgreSQL database named `financial_workspace`.

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgres://financial_workspace:financial_workspace@localhost:5432/financial_workspace"
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

Open Drizzle Studio:

```bash
npm run db:studio
```

`db:push` is available only for local development and prototyping. Use generated migrations for shared, staging, and production databases.

## Automation

The web app includes an Inngest client at `apps/web/src/inngest/client.ts`, a placeholder function at `apps/web/src/inngest/functions.ts`, and the API handler at `apps/web/src/app/api/inngest/route.ts`.

The database schema includes `automation_rules` and `automation_events` with Inngest event/run/function identifiers reserved for future workflow orchestration.
