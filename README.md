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

## Product areas

- Dashboard for the current financial operating picture.
- Clients for billing relationships and account context.
- Invoices and payments for receivables and getting paid faster.
- Expenses for spend tracking and receipt organization.
- Cashflow for short-term inflow, outflow, and risk visibility.
- Documents for contracts, receipts, invoices, and financial records.
- Automation rules and events for future workflow orchestration.

## Database

The Drizzle schema currently defines:

- `users`
- `workspaces`
- `clients`
- `invoices`
- `invoice_items`
- `payments`
- `expenses`
- `documents`
- `automation_rules`
- `automation_events`

Set `DATABASE_URL` before running Drizzle commands. The default `.env.example` assumes a local PostgreSQL database named `financial_workspace`.

## Automation

The web app includes an Inngest client at `apps/web/src/inngest/client.ts`, a placeholder function at `apps/web/src/inngest/functions.ts`, and the API handler at `apps/web/src/app/api/inngest/route.ts`.

The database schema includes `automation_rules` and `automation_events` with Inngest event/run/function identifiers reserved for future workflow orchestration.
