# Financial Workspace

A TypeScript monorepo for a structured financial operations workspace. It is designed for freelancers and small businesses that need to get paid faster, understand cashflow, organize client records, manage expenses, keep financial documents findable, and automate repetitive finance workflows.

This is intentionally broader than an invoice app: invoices are one workflow inside a workspace that connects clients, receivables, payments, expenses, documents, and automation events.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Inngest-ready automation foundation

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
