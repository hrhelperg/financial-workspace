import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Plus,
  ReceiptText,
  Timer,
  TrendingUp,
  WalletCards
} from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { MetricCard } from "@/components/metric-card";
import { OnboardingPanel } from "@/components/onboarding-panel";
import { PageHeader } from "@/components/page-header";
import { listClients } from "@/server/clients";
import { listInvoices } from "@/server/invoices";
import { getDashboardMetrics } from "@/server/dashboard";
import { formatCurrency, formatDate } from "@/server/format";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    installed?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const [metrics, recentInvoices, clients] = await Promise.all([
    getDashboardMetrics(),
    listInvoices(),
    listClients()
  ]);

  const recent = recentInvoices.slice(0, 5);
  const hasInstalledTemplate = Boolean(params.installed);
  const showActivationState = hasInstalledTemplate || (metrics.totalClients === 0 && metrics.totalInvoices === 0);

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

      <OnboardingPanel
        title={t("dashboard.onboardingTitle")}
        completedTitle={t("dashboard.onboardingCompleteTitle")}
        description={t("dashboard.onboardingDescription")}
        progressLabel={t("dashboard.onboardingProgress", { completed: "{{completed}}", total: "{{total}}" })}
        steps={[
          {
            id: "invoice",
            label: t("dashboard.nextCreateInvoice"),
            href: localizePath("/invoices/new?guided=invoice", locale)
          },
          {
            id: "expense",
            label: t("dashboard.nextAddExpense"),
            href: localizePath("/expenses?guided=expense", locale)
          },
          {
            id: "forecast",
            label: t("dashboard.nextViewForecast"),
            href: localizePath("/cashflow/forecast?guided=forecast", locale)
          }
        ]}
      />

      {showActivationState ? (
        <Panel>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                {hasInstalledTemplate ? (
                  <p className="text-sm font-semibold text-[#0f5f59]">
                    {t("dashboard.templateInstalled")}
                  </p>
                ) : null}
                <h2 className="mt-1 text-xl font-semibold tracking-normal text-[#1f2933]">
                  {t("dashboard.workspaceReadyTitle")}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#58645d]">
                  {t("dashboard.workspaceReadyDescription")}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[430px]">
              <Link
                href={localizePath("/invoices/new", locale)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
              >
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
                {t("dashboard.nextCreateInvoice")}
              </Link>
              <Link
                href={localizePath("/expenses", locale)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d8ded8] bg-white px-4 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("dashboard.nextAddExpense")}
              </Link>
              <Link
                href={localizePath("/cashflow/forecast", locale)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d8ded8] bg-white px-4 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
              >
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                {t("dashboard.nextViewForecast")}
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

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
