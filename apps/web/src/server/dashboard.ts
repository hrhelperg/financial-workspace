import "server-only";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { clients, db, invoices } from "@financial-workspace/db";
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
};

const UNPAID_STATUSES = ["draft", "sent", "overdue"] as const;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { workspace } = await requireWorkspaceMember();
  const workspaceId = workspace.id;
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
    .where(
      and(
        eq(invoices.workspaceId, workspaceId),
        eq(invoices.direction, "incoming"),
        inArray(invoices.status, unpaidStatuses)
      )
    );

  const [revenue] = await db
    .select({ total: sql<string>`coalesce(sum(${invoices.amountPaid}), '0')` })
    .from(invoices)
    .where(and(eq(invoices.workspaceId, workspaceId), eq(invoices.direction, "incoming")));

  const [incomingUnpaid] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount} - ${invoices.amountPaid}), '0')`
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.workspaceId, workspaceId),
        eq(invoices.direction, "incoming"),
        inArray(invoices.status, unpaidStatuses)
      )
    );

  const [outgoingUnpaid] = await db
    .select({
      total: sql<string>`coalesce(sum(${invoices.totalAmount} - ${invoices.amountPaid}), '0')`
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.workspaceId, workspaceId),
        eq(invoices.direction, "outgoing"),
        inArray(invoices.status, unpaidStatuses)
      )
    );

  const totalIncomingUnpaid = Number(incomingUnpaid?.total ?? 0);
  const totalOutgoingUnpaid = Number(outgoingUnpaid?.total ?? 0);

  return {
    totalClients: Number(clientCount?.total ?? 0),
    totalInvoices: Number(invoiceCount?.total ?? 0),
    unpaidInvoices: Number(unpaidCount?.total ?? 0),
    totalRevenue: Number(revenue?.total ?? 0),
    outstandingBalance: totalIncomingUnpaid,
    totalIncomingUnpaid,
    totalOutgoingUnpaid,
    projectedBalance: totalIncomingUnpaid - totalOutgoingUnpaid
  };
}
