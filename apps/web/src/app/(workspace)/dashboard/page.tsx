import { BriefcaseBusiness, DollarSign, ReceiptText, Timer, WalletCards } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { listClients } from "@/server/clients";
import { listInvoices } from "@/server/invoices";
import { getDashboardMetrics } from "@/server/dashboard";
import { formatCurrency, formatDate } from "@/server/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, recentInvoices, clients] = await Promise.all([
    getDashboardMetrics(),
    listInvoices(),
    listClients()
  ]);

  const recent = recentInvoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Financial control center"
        description="Receivables, clients, and invoice activity at a glance."
        actionLabel="New invoice"
        actionIcon={ReceiptText}
        actionHref="/invoices/new"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Clients"
          value={String(metrics.totalClients)}
          note="Active workspace relationships"
          icon={BriefcaseBusiness}
          tone="green"
        />
        <MetricCard
          title="Total invoices"
          value={String(metrics.totalInvoices)}
          note="Across all statuses"
          icon={ReceiptText}
          tone="blue"
        />
        <MetricCard
          title="Unpaid invoices"
          value={String(metrics.unpaidInvoices)}
          note="Drafts, sent, and overdue"
          icon={Timer}
          tone="amber"
        />
        <MetricCard
          title="Total revenue"
          value={formatCurrency(metrics.totalRevenue)}
          note="Sum of paid amounts"
          icon={DollarSign}
          tone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel>
          <PanelHeader title="Recent invoices" description="Latest activity in this workspace." />
          <div className="mt-5 divide-y divide-[#edf1ec]">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#58645d]">
                No invoices yet. Create one from the invoices page.
              </p>
            ) : (
              recent.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1f2933]">
                      {invoice.invoiceNumber} · {invoice.clientName}
                    </p>
                    <p className="mt-1 text-sm text-[#647067]">
                      Due {formatDate(invoice.dueDate)} · {invoice.status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#1f2933]">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Cashflow base" description="Unpaid incoming minus unpaid outgoing." />
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold tracking-normal text-[#1f2933]">
                {formatCurrency(metrics.projectedBalance)}
              </p>
              <p className="mt-2 text-sm text-[#647067]">
                Projected balance from unpaid invoices.
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#fff0cc] text-[#8a5a00]">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#647067]">Incoming unpaid</dt>
              <dd className="font-semibold text-[#1f2933]">{formatCurrency(metrics.totalIncomingUnpaid)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#647067]">Outgoing unpaid</dt>
              <dd className="font-semibold text-[#1f2933]">{formatCurrency(metrics.totalOutgoingUnpaid)}</dd>
            </div>
          </dl>
          <div className="mt-6 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4 text-sm text-[#58645d]">
            {clients.length === 0
              ? "Add your first client to start invoicing."
              : `Workspace has ${clients.length} client${clients.length === 1 ? "" : "s"}.`}
          </div>
        </Panel>
      </div>
    </div>
  );
}
