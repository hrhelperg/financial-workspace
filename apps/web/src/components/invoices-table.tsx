import Link from "next/link";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import type { InvoiceDirection, InvoiceDirectionFilter, InvoiceListItem, InvoiceStatus } from "@/server/invoices";
import { formatCurrency, formatDate } from "@/server/format";

const statusTones: Record<InvoiceStatus, "amber" | "blue" | "green" | "neutral" | "rose"> = {
  cancelled: "neutral",
  draft: "amber",
  overdue: "rose",
  paid: "green",
  sent: "blue"
};

const statusLabels: Record<InvoiceStatus, string> = {
  cancelled: "Cancelled",
  draft: "Draft",
  overdue: "Overdue",
  paid: "Paid",
  sent: "Sent"
};

const directionLabels: Record<InvoiceDirection, string> = {
  incoming: "Incoming",
  outgoing: "Outgoing"
};

const directionTones: Record<InvoiceDirection, "blue" | "rose"> = {
  incoming: "blue",
  outgoing: "rose"
};

const directionFilters: Array<{ href: string; label: string; value: InvoiceDirectionFilter }> = [
  { href: "/invoices", label: "All", value: "all" },
  { href: "/invoices?direction=incoming", label: "Incoming", value: "incoming" },
  { href: "/invoices?direction=outgoing", label: "Outgoing", value: "outgoing" }
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
  invoices
}: {
  activeDirection: InvoiceDirectionFilter;
  invoices: InvoiceListItem[];
}) {
  return (
    <Panel>
      <PanelHeader title="Invoices list" description="Filter by money direction and review fiscal-year metadata." />
      <div className="mt-5 flex flex-wrap gap-2">
        {directionFilters.map((filter) => (
          <Link
            aria-current={activeDirection === filter.value ? "page" : undefined}
            className={filterClassName(activeDirection === filter.value)}
            href={filter.href}
            key={filter.value}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto">
        {invoices.length === 0 ? (
          <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
            No invoices found for this filter.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
            <thead>
              <tr className="text-left text-[#58645d]">
                <th className="whitespace-nowrap py-3 pr-4 font-semibold">Invoice</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Client</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Direction</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Due</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Items</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Total</th>
                <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ec]">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="whitespace-nowrap py-4 pr-4">
                    <div className="font-semibold text-[#1f2933]">{invoice.invoiceNumber}</div>
                    <div className="mt-1 text-xs font-medium text-[#647067]">FY {invoice.fiscalYear}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">{invoice.clientName}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={directionTones[invoice.direction]}>{directionLabels[invoice.direction]}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={statusTones[invoice.status]}>{statusLabels[invoice.status]}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">{formatDate(invoice.dueDate)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-[#1f2933]">{invoice.itemCount}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(balance(invoice), invoice.currency)}
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
