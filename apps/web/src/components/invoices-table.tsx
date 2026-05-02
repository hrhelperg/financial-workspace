import Link from "next/link";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { localizePath, type Locale } from "@/i18n/config";
import { createTranslator } from "@/i18n/messages";
import type { InvoiceDirection, InvoiceDirectionFilter, InvoiceListItem, InvoiceStatus } from "@/server/invoices";
import { formatCurrency, formatDate } from "@/server/format";

const statusTones: Record<InvoiceStatus, "amber" | "blue" | "green" | "neutral" | "rose"> = {
  cancelled: "neutral",
  draft: "amber",
  overdue: "rose",
  paid: "green",
  sent: "blue"
};

const directionTones: Record<InvoiceDirection, "blue" | "rose"> = {
  incoming: "blue",
  outgoing: "rose"
};

const directionFilters: Array<{ href: string; labelKey: "invoices.all" | "invoices.incoming" | "invoices.outgoing"; value: InvoiceDirectionFilter }> = [
  { href: "/invoices", labelKey: "invoices.all", value: "all" },
  { href: "/invoices?direction=incoming", labelKey: "invoices.incoming", value: "incoming" },
  { href: "/invoices?direction=outgoing", labelKey: "invoices.outgoing", value: "outgoing" }
];

function filterClassName(active: boolean) {
  return [
    "inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
    active
      ? "border-[#1f2933] bg-[#1f2933] text-white"
      : "border-[#d8ded8] bg-white text-[#58645d] hover:bg-[#f8faf7] hover:text-[#1f2933]"
  ].join(" ");
}

function balance(invoice: InvoiceListItem): number {
  const total = Number(invoice.totalAmount);
  const paid = Number(invoice.amountPaid);
  return Math.max((Number.isFinite(total) ? total : 0) - (Number.isFinite(paid) ? paid : 0), 0);
}

export function InvoicesTable({
  activeDirection,
  invoices,
  locale
}: {
  activeDirection: InvoiceDirectionFilter;
  invoices: InvoiceListItem[];
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const statusLabels: Record<InvoiceStatus, string> = {
    cancelled: t("invoices.status.cancelled"),
    draft: t("invoices.status.draft"),
    overdue: t("invoices.status.overdue"),
    paid: t("invoices.status.paid"),
    sent: t("invoices.status.sent")
  };
  const directionLabels: Record<InvoiceDirection, string> = {
    incoming: t("invoices.incoming"),
    outgoing: t("invoices.outgoing")
  };

  return (
    <Panel>
      <PanelHeader title={t("invoices.listTitle")} description={t("invoices.listDescription")} />
      <div className="mt-5 flex flex-wrap gap-2">
        {directionFilters.map((filter) => (
          <Link
            aria-current={activeDirection === filter.value ? "page" : undefined}
            className={filterClassName(activeDirection === filter.value)}
            href={localizePath(filter.href, locale)}
            key={filter.value}
          >
            {t(filter.labelKey)}
          </Link>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto">
        {invoices.length === 0 ? (
          <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
            {t("invoices.empty")}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
            <thead>
              <tr className="text-left text-[#58645d]">
                <th className="whitespace-nowrap py-3 pr-4 font-semibold">{t("invoices.invoice")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("invoices.client")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("common.labels.direction")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("common.labels.status")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("invoices.due")}</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">{t("invoices.items")}</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">{t("common.labels.total")}</th>
                <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">{t("invoices.balance")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ec]">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="whitespace-nowrap py-4 pr-4">
                    <div className="font-semibold text-[#1f2933]">{invoice.invoiceNumber}</div>
                    <div className="mt-1 text-xs font-medium text-[#647067]">
                      {t("invoices.fiscalYearShort", { year: invoice.fiscalYear })}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">{invoice.clientName}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={directionTones[invoice.direction]}>{directionLabels[invoice.direction]}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={statusTones[invoice.status]}>{statusLabels[invoice.status]}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">
                    {formatDate(invoice.dueDate, locale)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-[#1f2933]">{invoice.itemCount}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(invoice.totalAmount, invoice.currency, locale)}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(balance(invoice), invoice.currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}
