"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { invoiceStatusValues } from "@financial-workspace/db/schema";
import {
  inputClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName
} from "@/components/form-styles";

type Status = (typeof invoiceStatusValues)[number];

const statusLabels: Record<Status, string> = {
  cancelled: "Cancelled",
  draft: "Draft",
  overdue: "Overdue",
  paid: "Paid",
  sent: "Sent"
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type ClientOption = { id: string; name: string };

type FieldErrors = Record<string, string>;

type ApiErrorResponse = {
  errors?: Array<{ field: string; message: string }>;
};

function blankLineItem(): LineItem {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 2,
    style: "currency"
  }).format(amount);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function InvoiceForm({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([blankLineItem()]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    lineItems.forEach((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const tax = lineSubtotal * (item.taxRate / 100);
      subtotal += lineSubtotal;
      taxTotal += tax;
    });

    return {
      subtotal,
      taxTotal,
      total: subtotal + taxTotal
    };
  }, [lineItems]);

  function updateLineItem(id: string, key: keyof Omit<LineItem, "id">, value: string) {
    setLineItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: key === "description" ? value : toNumber(value)
            }
          : item
      )
    );
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      clientId: formData.get("clientId"),
      invoiceNumber: formData.get("invoiceNumber"),
      status: formData.get("status"),
      issueDate: formData.get("issueDate"),
      dueDate: formData.get("dueDate"),
      currency: formData.get("currency") || "USD",
      notes: formData.get("notes"),
      terms: formData.get("terms"),
      items: lineItems
        .filter((item) => item.description.trim().length > 0)
        .map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate
        }))
    };

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        const errors = body?.errors ?? [];
        const nextFieldErrors: FieldErrors = {};
        let general: string | null = null;

        errors.forEach((error) => {
          if (error.field === "_" || error.field === "items") {
            general = error.message;
          } else {
            nextFieldErrors[error.field] = error.message;
          }
        });

        setFieldErrors(nextFieldErrors);
        setGeneralError(general ?? "Could not create invoice.");
        return;
      }

      router.push("/invoices");
      router.refresh();
    } catch {
      setGeneralError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-5 text-sm text-[#58645d]">
        Create a client first before issuing an invoice.
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-3">
        <label className={labelClassName}>
          Invoice number
          <input
            className={inputClassName}
            name="invoiceNumber"
            placeholder="Auto-generated if empty"
          />
        </label>
        <label className={labelClassName}>
          Client
          <select className={inputClassName} name="clientId" required defaultValue={clients[0].id}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {fieldErrors.clientId ? (
            <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.clientId}</span>
          ) : null}
        </label>
        <label className={labelClassName}>
          Status
          <select className={inputClassName} name="status" required defaultValue="draft">
            {invoiceStatusValues.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClassName}>
          Issue date
          <input className={inputClassName} defaultValue={todayIso()} name="issueDate" required type="date" />
          {fieldErrors.issueDate ? (
            <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.issueDate}</span>
          ) : null}
        </label>
        <label className={labelClassName}>
          Due date
          <input className={inputClassName} defaultValue={addDaysIso(14)} name="dueDate" required type="date" />
          {fieldErrors.dueDate ? (
            <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.dueDate}</span>
          ) : null}
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
            className={secondaryButtonClassName}
            onClick={() => setLineItems((current) => [...current, blankLineItem()])}
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
          <input type="hidden" name="currency" value="USD" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[#647067]">Subtotal</dt>
              <dd className="font-semibold text-[#1f2933]">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#647067]">Tax</dt>
              <dd className="font-semibold text-[#1f2933]">{formatMoney(totals.taxTotal)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[#d8ded8] pt-3">
              <dt className="font-semibold text-[#1f2933]">Total</dt>
              <dd className="font-semibold text-[#1f2933]">{formatMoney(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {generalError ? (
        <p className="rounded-md border border-[#f0c4c4] bg-[#ffe7e7] px-3 py-2 text-sm text-[#a13d3d]">
          {generalError}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button className={primaryButtonClassName} disabled={submitting} type="submit">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          {submitting ? "Creating…" : "Create invoice"}
        </button>
      </div>
    </form>
  );
}
