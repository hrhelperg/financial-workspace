import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import type { InvoiceListItem, InvoiceStatus } from "@/server/invoices";
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

function balance(invoice: InvoiceListItem): number {
  const total = Number(invoice.totalAmount);
  const paid = Number(invoice.amountPaid);
  return Math.max((Number.isFinite(total) ? total : 0) - (Number.isFinite(paid) ? paid : 0), 0);
}

export function InvoicesTable({ invoices }: { invoices: InvoiceListItem[] }) {
  return (
    <Panel>
      <PanelHeader title="Invoices list" description="Status, due dates, totals, and outstanding balance." />
      <div className="mt-5 overflow-x-auto">
        {invoices.length === 0 ? (
          <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
            No invoices yet. Create one to track receivables.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
            <thead>
              <tr className="text-left text-[#58645d]">
                <th className="whitespace-nowrap py-3 pr-4 font-semibold">Invoice</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Client</th>
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
                  <td className="whitespace-nowrap py-4 pr-4 font-semibold text-[#1f2933]">{invoice.invoiceNumber}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">{invoice.clientName}</td>
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
