"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, ReceiptText, Trash2, WalletCards } from "lucide-react";
import {
  calculateInvoiceItems,
  calculateInvoiceTotals,
  formatCurrency,
  getInvoiceBalance,
  initialClients,
  initialInvoices,
  invoiceStatusLabels,
  invoiceStatuses,
  invoiceStatusTones,
  type InvoiceLineItem,
  type InvoiceRecord,
  type InvoiceStatus
} from "@financial-workspace/core";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";

const inputClassName =
  "mt-2 w-full rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm text-[#1f2933] outline-none transition-colors placeholder:text-[#8a948c] focus:border-[#0f766e] focus:ring-2 focus:ring-[#b8e2d8]";
const labelClassName = "text-sm font-semibold text-[#1f2933]";

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createBlankLineItem(): InvoiceLineItem {
  return {
    id: createId("item"),
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    lineTotal: 0
  };
}

function field(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() ?? "";
}

function numberField(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getNextInvoiceNumber(invoices: InvoiceRecord[]) {
  const highest = invoices.reduce((max, invoice) => {
    const match = invoice.invoiceNumber.match(/(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1024);

  return `FW-${highest + 1}`;
}

export function InvoicesMvp() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(initialInvoices);
  const [invoiceNumber, setInvoiceNumber] = useState(() => getNextInvoiceNumber(initialInvoices));
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([createBlankLineItem()]);

  const calculatedItems = useMemo(() => calculateInvoiceItems(lineItems), [lineItems]);
  const totals = useMemo(() => calculateInvoiceTotals(lineItems), [lineItems]);
  const openReceivables = useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
        .reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0),
    [invoices]
  );

  function updateLineItem(id: string, fieldName: "description" | "quantity" | "unitPrice" | "taxRate", value: string) {
    setLineItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [fieldName]: fieldName === "description" ? value : numberField(value)
            }
          : item
      )
    );
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  }

  function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientId = field(formData, "clientId");
    const client = initialClients.find((item) => item.id === clientId);
    const statusValue = field(formData, "status") as InvoiceStatus;

    if (!client || !invoiceStatuses.includes(statusValue) || calculatedItems.every((item) => !item.description)) {
      return;
    }

    const newInvoice: InvoiceRecord = {
      id: createId("invoice"),
      workspaceId: "workspace-demo",
      clientId: client.id,
      clientName: client.name,
      invoiceNumber: invoiceNumber || getNextInvoiceNumber(invoices),
      status: statusValue,
      issueDate: field(formData, "issueDate"),
      dueDate: field(formData, "dueDate"),
      currency: "USD",
      notes: field(formData, "notes") || null,
      terms: field(formData, "terms") || "Net 14",
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      amountPaid: statusValue === "paid" ? totals.total : 0,
      items: calculatedItems.filter((item) => item.description)
    };

    const nextInvoices = [newInvoice, ...invoices];

    setInvoices(nextInvoices);
    setInvoiceNumber(getNextInvoiceNumber(nextInvoices));
    setLineItems([createBlankLineItem()]);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <PanelHeader title="Create invoice" description="Build an invoice with itemized work and payment status." />
          <form className="mt-5 space-y-5" onSubmit={handleCreateInvoice}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className={labelClassName}>
                Invoice number
                <input
                  className={inputClassName}
                  name="invoiceNumber"
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  required
                  value={invoiceNumber}
                />
              </label>
              <label className={labelClassName}>
                Client
                <select className={inputClassName} name="clientId" required>
                  {initialClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Status
                <select className={inputClassName} name="status" required>
                  {invoiceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {invoiceStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Issue date
                <input className={inputClassName} defaultValue="2026-05-01" name="issueDate" required type="date" />
              </label>
              <label className={labelClassName}>
                Due date
                <input className={inputClassName} defaultValue="2026-05-15" name="dueDate" required type="date" />
              </label>
              <label className={labelClassName}>
                Terms
                <input className={inputClassName} defaultValue="Net 14" name="terms" />
              </label>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-[#1f2933]">Invoice items</h2>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f0f2ec]"
                  onClick={() => setLineItems((current) => [...current, createBlankLineItem()])}
                  type="button"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add item
                </button>
              </div>
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-3 lg:grid-cols-[1fr_0.28fr_0.34fr_0.28fr_auto]"
                  >
                    <label className={labelClassName}>
                      Description
                      <input
                        className={inputClassName}
                        onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                        placeholder="Consulting, design, or operations work"
                        value={item.description}
                      />
                    </label>
                    <label className={labelClassName}>
                      Qty
                      <input
                        className={inputClassName}
                        min="0"
                        onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                        step="0.25"
                        type="number"
                        value={item.quantity}
                      />
                    </label>
                    <label className={labelClassName}>
                      Unit price
                      <input
                        className={inputClassName}
                        min="0"
                        onChange={(event) => updateLineItem(item.id, "unitPrice", event.target.value)}
                        step="0.01"
                        type="number"
                        value={item.unitPrice}
                      />
                    </label>
                    <label className={labelClassName}>
                      Tax %
                      <input
                        className={inputClassName}
                        min="0"
                        onChange={(event) => updateLineItem(item.id, "taxRate", event.target.value)}
                        step="0.01"
                        type="number"
                        value={item.taxRate}
                      />
                    </label>
                    <button
                      className="mt-7 flex h-10 w-10 items-center justify-center rounded-md border border-[#d8ded8] bg-white text-[#58645d] transition-colors hover:bg-[#ffe7e7] hover:text-[#a13d3d]"
                      onClick={() => removeLineItem(item.id)}
                      title="Remove item"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.45fr]">
              <label className={labelClassName}>
                Notes
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  name="notes"
                  placeholder="Payment details or reminder context"
                />
              </label>
              <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#647067]">Subtotal</dt>
                    <dd className="font-semibold text-[#1f2933]">{formatCurrency(totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#647067]">Tax</dt>
                    <dd className="font-semibold text-[#1f2933]">{formatCurrency(totals.taxTotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[#d8ded8] pt-3">
                    <dt className="font-semibold text-[#1f2933]">Total</dt>
                    <dd className="font-semibold text-[#1f2933]">{formatCurrency(totals.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
            >
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Create invoice
            </button>
          </form>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#647067]">Invoices</p>
                <p className="mt-3 text-2xl font-semibold tracking-normal text-[#1f2933]">{invoices.length}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e7efff] text-[#2455a4]">
                <ReceiptText className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-sm text-[#647067]">Drafts, sent invoices, and paid records.</p>
          </Panel>
          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#647067]">Open receivables</p>
                <p className="mt-3 text-2xl font-semibold tracking-normal text-[#1f2933]">
                  {formatCurrency(openReceivables)}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#fff0cc] text-[#8a5a00]">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-sm text-[#647067]">Outstanding balance before payments clear.</p>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader title="Invoices list" description="Invoice state, due dates, item counts, and collection balance." />
        <div className="mt-5 overflow-x-auto">
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
                    <StatusPill tone={invoiceStatusTones[invoice.status]}>
                      {invoiceStatusLabels[invoice.status]}
                    </StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">{invoice.dueDate}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-[#1f2933]">{invoice.items.length}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(getInvoiceBalance(invoice), invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
