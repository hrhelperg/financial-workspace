import { BriefcaseBusiness, CalendarDays, DollarSign, ReceiptText, Timer, WalletCards } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { listClients } from "@/server/clients";
import { listInvoices } from "@/server/invoices";
import { getDashboardMetrics } from "@/server/dashboard";
import { formatCurrency, formatDate } from "@/server/format";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { locale, t } = await getI18n();
  const [metrics, recentInvoices, clients] = await Promise.all([
    getDashboardMetrics(),
    listInvoices(),
    listClients()
  ]);

  const recent = recentInvoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actionLabel={t("dashboard.newInvoice")}
        actionIcon={ReceiptText}
        actionHref={localizePath("/invoices/new", locale)}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t("dashboard.clientsTitle")}
          value={String(metrics.totalClients)}
          note={t("dashboard.clientsNote")}
          icon={BriefcaseBusiness}
          tone="green"
        />
        <MetricCard
          title={t("dashboard.totalInvoices")}
          value={String(metrics.totalInvoices)}
          note={t("dashboard.totalInvoicesNote")}
          icon={ReceiptText}
          tone="blue"
        />
        <MetricCard
          title={t("dashboard.unpaidInvoices")}
          value={String(metrics.unpaidInvoices)}
          note={t("dashboard.unpaidInvoicesNote")}
          icon={Timer}
          tone="amber"
        />
        <MetricCard
          title={t("dashboard.totalRevenue")}
          value={formatCurrency(metrics.totalRevenue, "USD", locale)}
          note={t("dashboard.totalRevenueNote")}
          icon={DollarSign}
          tone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel>
          <PanelHeader title={t("dashboard.recentInvoices")} description={t("dashboard.recentInvoicesDescription")} />
          <div className="mt-5 divide-y divide-[#edf1ec]">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#58645d]">
                {t("dashboard.noInvoices")}
              </p>
            ) : (
              recent.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1f2933]">
                      {invoice.invoiceNumber} · {invoice.clientName}
                    </p>
                    <p className="mt-1 text-sm text-[#647067]">
                      {t("dashboard.dueLine", {
                        date: formatDate(invoice.dueDate, locale),
                        status: t(`invoices.status.${invoice.status}`)
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#1f2933]">
                    {formatCurrency(invoice.totalAmount, invoice.currency, locale)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title={t("dashboard.cashflowTitle")} description={t("dashboard.cashflowDescription")} />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-normal text-[#1f2933]">
                  {formatCurrency(metrics.projectedBalance, "USD", locale)}
                </p>
                <p className="mt-2 text-sm text-[#647067]">
                  {t("dashboard.projectedBalanceNote")}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#fff0cc] text-[#8a5a00]">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#647067]">{t("dashboard.incomingUnpaid")}</dt>
                <dd className="font-semibold text-[#1f2933]">
                  {formatCurrency(metrics.totalIncomingUnpaid, "USD", locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#647067]">{t("dashboard.outgoingUnpaid")}</dt>
                <dd className="font-semibold text-[#1f2933]">
                  {formatCurrency(metrics.totalOutgoingUnpaid, "USD", locale)}
                </dd>
              </div>
            </dl>
            <div className="mt-6 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4 text-sm text-[#58645d]">
              {clients.length === 0
                ? t("dashboard.addFirstClient")
                : t("dashboard.workspaceClientCount", {
                    count: clients.length,
                    plural: clients.length === 1 ? "" : "s"
                  })}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title={t("dashboard.forecastTitle", { year: metrics.forecastYear })}
              description={t("dashboard.forecastDescription")}
            />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-normal text-[#1f2933]">
                  {formatCurrency(metrics.forecastProjectedNet, metrics.forecastCurrency, locale)}
                </p>
                <p className="mt-2 text-sm text-[#647067]">{t("dashboard.forecastNote")}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e7efff] text-[#2455a4]">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#647067]">{t("dashboard.expectedIncome")}</dt>
                <dd className="font-semibold text-[#1f2933]">
                  {formatCurrency(metrics.expectedIncome, metrics.forecastCurrency, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#647067]">{t("dashboard.expectedExpenses")}</dt>
                <dd className="font-semibold text-[#1f2933]">
                  {formatCurrency(metrics.expectedExpenses, metrics.forecastCurrency, locale)}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
