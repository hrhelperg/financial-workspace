"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { invoiceDirectionValues, invoiceStatusValues } from "@financial-workspace/db/schema";
import {
  inputClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName
} from "@/components/form-styles";
import { markOnboardingStepComplete } from "@/components/onboarding-panel";
import { localeHeaderName } from "@/i18n/config";
import { useLocale, useLocalizedPath, useTranslator } from "@/i18n/client";

type Status = (typeof invoiceStatusValues)[number];
type Direction = (typeof invoiceDirectionValues)[number];

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type ClientOption = { id: string; name: string };

type FieldErrors = Record<string, string>;

type InvoiceFormDefaults = {
  clientId?: string;
  invoiceNumber?: string;
  direction?: Direction;
  status?: Status;
  issueDate?: string;
  dueDate?: string;
  terms?: string;
  notes?: string;
  items?: Array<Omit<LineItem, "id">>;
};

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

function formatMoney(amount: number, locale: string, currency = "USD") {
  return new Intl.NumberFormat(locale, {
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

export function InvoiceForm({
  clients,
  defaultValues,
  guidedStep
}: {
  clients: ClientOption[];
  defaultValues?: InvoiceFormDefaults;
  guidedStep?: "invoice";
}) {
  const router = useRouter();
  const locale = useLocale();
  const localize = useLocalizedPath();
  const t = useTranslator();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>(() =>
    defaultValues?.items?.length
      ? defaultValues.items.map((item) => ({
          ...item,
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
        }))
      : [blankLineItem()]
  );

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
      direction: formData.get("direction") || "incoming",
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
        headers: { "content-type": "application/json", [localeHeaderName]: locale },
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
        setGeneralError(general ?? t("invoices.createFailed"));
        return;
      }

      if (guidedStep) {
        markOnboardingStepComplete(guidedStep);
        router.push(localize("/dashboard"));
      } else {
        router.push(localize("/invoices"));
      }
      router.refresh();
    } catch {
      setGeneralError(t("common.errors.network"));
    } finally {
      setSubmitting(false);
    }
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-5 text-sm text-[#58645d]">
        {t("invoices.createClientFirst")}
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-3">
        <label className={labelClassName}>
          {t("invoices.invoiceNumber")}
          <input
            className={inputClassName}
            defaultValue={defaultValues?.invoiceNumber}
            name="invoiceNumber"
            placeholder={t("invoices.invoiceNumberPlaceholder")}
          />
        </label>
        <label className={labelClassName}>
          {t("invoices.clientSupplier")}
          <select className={inputClassName} name="clientId" required defaultValue={defaultValues?.clientId ?? clients[0].id}>
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
          {t("common.labels.direction")}
          <select className={inputClassName} name="direction" required defaultValue={defaultValues?.direction ?? "incoming"}>
            {invoiceDirectionValues.map((direction) => (
              <option key={direction} value={direction}>
                {direction === "incoming" ? t("invoices.incomingLong") : t("invoices.outgoingLong")}
              </option>
            ))}
          </select>
          {fieldErrors.direction ? (
            <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.direction}</span>
          ) : null}
        </label>
        <label className={labelClassName}>
          {t("common.labels.status")}
          <select className={inputClassName} name="status" required defaultValue={defaultValues?.status ?? "draft"}>
            {invoiceStatusValues.map((status) => (
              <option key={status} value={status}>
                {t(`invoices.status.${status}`)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClassName}>
          {t("invoices.issueDate")}
          <input className={inputClassName} defaultValue={defaultValues?.issueDate ?? todayIso()} name="issueDate" required type="date" />
          {fieldErrors.issueDate ? (
            <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.issueDate}</span>
          ) : null}
        </label>
        <label className={labelClassName}>
          {t("invoices.dueDate")}
          <input className={inputClassName} defaultValue={defaultValues?.dueDate ?? addDaysIso(14)} name="dueDate" required type="date" />
          {fieldErrors.dueDate ? (
            <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.dueDate}</span>
          ) : null}
        </label>
        <label className={labelClassName}>
          {t("invoices.terms")}
          <input className={inputClassName} defaultValue={defaultValues?.terms ?? "Net 14"} name="terms" />
        </label>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-[#1f2933]">{t("invoices.itemsTitle")}</h2>
          <button
            className={secondaryButtonClassName}
            onClick={() => setLineItems((current) => [...current, blankLineItem()])}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("invoices.addItem")}
          </button>
        </div>
        <div className="space-y-3">
          {lineItems.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-3 lg:grid-cols-[1fr_0.28fr_0.34fr_0.28fr_auto]"
            >
              <label className={labelClassName}>
                {t("invoices.description")}
                <input
                  className={inputClassName}
                  onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                  placeholder={t("invoices.descriptionPlaceholder")}
                  value={item.description}
                />
              </label>
              <label className={labelClassName}>
                {t("invoices.quantity")}
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
                {t("invoices.unitPrice")}
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
                {t("invoices.tax")}
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
                title={t("invoices.removeItem")}
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
          {t("common.labels.notes")}
          <textarea
            className={`${inputClassName} min-h-24 resize-y`}
            defaultValue={defaultValues?.notes}
            name="notes"
            placeholder={t("invoices.notesPlaceholder")}
          />
        </label>
        <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4">
          <input type="hidden" name="currency" value="USD" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[#647067]">{t("invoices.subtotal")}</dt>
              <dd className="font-semibold text-[#1f2933]">{formatMoney(totals.subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#647067]">{t("invoices.taxTotal")}</dt>
              <dd className="font-semibold text-[#1f2933]">{formatMoney(totals.taxTotal, locale)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-[#d8ded8] pt-3">
              <dt className="font-semibold text-[#1f2933]">{t("common.labels.total")}</dt>
              <dd className="font-semibold text-[#1f2933]">{formatMoney(totals.total, locale)}</dd>
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
          {submitting ? t("invoices.creating") : t("invoices.create")}
        </button>
      </div>
    </form>
  );
}
