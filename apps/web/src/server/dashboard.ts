import "server-only";
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { clients, db, financialForecasts, invoices } from "@financial-workspace/db";
import { getCurrentYear } from "./forecast";
import { requireWorkspaceMember } from "./workspace";

export type DashboardMetrics = {
  totalClients: number;
  totalInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
  totalIncomingUnpaid: number;
  totalOutgoingUnpaid: number;
  projectedBalance: number;
  forecastYear: number;
  expectedIncome: number;
  expectedExpenses: number;
  forecastProjectedNet: number;
  forecastCurrency: string;
};

const UNPAID_STATUSES = ["draft", "sent", "overdue"] as const;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { workspace } = await requireWorkspaceMember();
  const workspaceId = workspace.id;
  const unpaidStatuses = [...UNPAID_STATUSES];
  const forecastYear = getCurrentYear();

  const activeInvoiceFilter = and(eq(invoices.workspaceId, workspaceId), isNull(invoices.deletedAt));

  const [clientCount] = await db
    .select({ total: count() })
    .from(clients)
    .where(and(eq(clients.workspaceId, workspaceId), isNull(clients.deletedAt)));

  const [invoiceCount] = await db
    .select({ total: count() })
    .from(invoices)
    .where(activeInvoiceFilter);

  const [unpaidCount] = await db
    .select({ total: count() })
    .from(invoices)
    .where(
      and(activeInvoiceFilter, eq(invoices.direction, "incoming"), inArray(invoices.status, unpaidStatuses))
    );

  const [revenue] = await db
    .select({ total: sql<string>`coalesce(sum(${invoices.amountPaid}), '0')` })
    .from(invoices)
    .where(and(activeInvoiceFilter, eq(invoices.direction, "incoming")));

  const [incomingUnpaid] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount} - ${invoices.amountPaid}), '0')`
    })
    .from(invoices)
    .where(
      and(activeInvoiceFilter, eq(invoices.direction, "incoming"), inArray(invoices.status, unpaidStatuses))
    );

  const [outgoingUnpaid] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount} - ${invoices.amountPaid}), '0')`
    })
    .from(invoices)
    .where(
      and(activeInvoiceFilter, eq(invoices.direction, "outgoing"), inArray(invoices.status, unpaidStatuses))
    );

  const [forecast] = await db
    .select({
      expectedIncome: financialForecasts.expectedIncome,
      expectedExpenses: financialForecasts.expectedExpenses,
      currency: financialForecasts.currency
    })
    .from(financialForecasts)
    .where(and(eq(financialForecasts.workspaceId, workspaceId), eq(financialForecasts.year, forecastYear)))
    .limit(1);

  const totalIncomingUnpaid = Number(incomingUnpaid?.total ?? 0);
  const totalOutgoingUnpaid = Number(outgoingUnpaid?.total ?? 0);
  const expectedIncome = Number(forecast?.expectedIncome ?? 0);
  const expectedExpenses = Number(forecast?.expectedExpenses ?? 0);

  return {
    totalClients: Number(clientCount?.total ?? 0),
    totalInvoices: Number(invoiceCount?.total ?? 0),
    unpaidInvoices: Number(unpaidCount?.total ?? 0),
    totalRevenue: Number(revenue?.total ?? 0),
    outstandingBalance: totalIncomingUnpaid,
    totalIncomingUnpaid,
    totalOutgoingUnpaid,
    projectedBalance: totalIncomingUnpaid - totalOutgoingUnpaid,
    forecastYear,
    expectedIncome,
    expectedExpenses,
    forecastProjectedNet: expectedIncome - expectedExpenses,
    forecastCurrency: forecast?.currency ?? "USD"
  };
}
