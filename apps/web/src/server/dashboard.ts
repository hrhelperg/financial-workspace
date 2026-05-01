import "server-only";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { clients, db, invoices } from "@financial-workspace/db";
import { getDefaultWorkspaceId } from "./workspace";

export type DashboardMetrics = {
  totalClients: number;
  totalInvoices: number;
  unpaidInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
};

const UNPAID_STATUSES = ["draft", "sent", "overdue"] as const;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const workspaceId = await getDefaultWorkspaceId();
  const unpaidStatuses = [...UNPAID_STATUSES];

  const [clientCount] = await db
    .select({ total: count() })
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId));

  const [invoiceCount] = await db
    .select({ total: count() })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId));

  const [unpaidCount] = await db
    .select({ total: count() })
    .from(invoices)
    .where(and(eq(invoices.workspaceId, workspaceId), inArray(invoices.status, unpaidStatuses)));

  const [revenue] = await db
    .select({ total: sql<string>`coalesce(sum(${invoices.amountPaid}), '0')` })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId));

  const [outstanding] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount} - ${invoices.amountPaid}), '0')`
    })
    .from(invoices)
    .where(and(eq(invoices.workspaceId, workspaceId), inArray(invoices.status, unpaidStatuses)));

  return {
    totalClients: Number(clientCount?.total ?? 0),
    totalInvoices: Number(invoiceCount?.total ?? 0),
    unpaidInvoices: Number(unpaidCount?.total ?? 0),
    totalRevenue: Number(revenue?.total ?? 0),
    outstandingBalance: Number(outstanding?.total ?? 0)
  };
}
