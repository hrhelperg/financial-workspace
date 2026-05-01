import "server-only";
import { invoiceStatusValues } from "@financial-workspace/db";

export type ValidationError = { field: string; message: string };

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function trimOrNull(value: unknown): string | null {
  if (!isString(value)) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function trimOrEmpty(value: unknown): string {
  if (!isString(value)) {
    return "";
  }

  return value.trim();
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type CreateClientPayload = {
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export function parseCreateClientPayload(input: unknown): ValidationResult<CreateClientPayload> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return { success: false, errors: [{ field: "_", message: "Body must be an object." }] };
  }

  const body = input as Record<string, unknown>;
  const name = trimOrEmpty(body.name);

  if (name.length === 0) {
    errors.push({ field: "name", message: "Client name is required." });
  } else if (name.length > 255) {
    errors.push({ field: "name", message: "Client name must be 255 characters or fewer." });
  }

  const email = trimOrNull(body.email);
  if (email && !email.includes("@")) {
    errors.push({ field: "email", message: "Email must be a valid address." });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      companyName: trimOrNull(body.companyName),
      email,
      phone: trimOrNull(body.phone),
      notes: trimOrNull(body.notes)
    }
  };
}

export type CreateInvoiceItemPayload = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type CreateInvoicePayload = {
  clientId: string;
  invoiceNumber: string | null;
  status: (typeof invoiceStatusValues)[number];
  issueDate: string;
  dueDate: string;
  currency: string;
  notes: string | null;
  terms: string | null;
  items: CreateInvoiceItemPayload[];
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function parseCreateInvoicePayload(input: unknown): ValidationResult<CreateInvoicePayload> {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== "object") {
    return { success: false, errors: [{ field: "_", message: "Body must be an object." }] };
  }

  const body = input as Record<string, unknown>;

  const clientId = trimOrEmpty(body.clientId);
  if (clientId.length === 0) {
    errors.push({ field: "clientId", message: "Client is required." });
  }

  const status = trimOrEmpty(body.status);
  if (!invoiceStatusValues.includes(status as (typeof invoiceStatusValues)[number])) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${invoiceStatusValues.join(", ")}.`
    });
  }

  const issueDate = trimOrEmpty(body.issueDate);
  if (!ISO_DATE.test(issueDate)) {
    errors.push({ field: "issueDate", message: "Issue date must be YYYY-MM-DD." });
  }

  const dueDate = trimOrEmpty(body.dueDate);
  if (!ISO_DATE.test(dueDate)) {
    errors.push({ field: "dueDate", message: "Due date must be YYYY-MM-DD." });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const cleanedItems: CreateInvoiceItemPayload[] = [];

  rawItems.forEach((rawItem, index) => {
    if (!rawItem || typeof rawItem !== "object") {
      return;
    }

    const item = rawItem as Record<string, unknown>;
    const description = trimOrEmpty(item.description);

    if (description.length === 0) {
      return;
    }

    const quantity = toFiniteNumber(item.quantity) ?? 0;
    const unitPrice = toFiniteNumber(item.unitPrice) ?? 0;
    const taxRate = toFiniteNumber(item.taxRate) ?? 0;

    if (quantity < 0) {
      errors.push({ field: `items.${index}.quantity`, message: "Quantity cannot be negative." });
    }
    if (unitPrice < 0) {
      errors.push({ field: `items.${index}.unitPrice`, message: "Unit price cannot be negative." });
    }
    if (taxRate < 0) {
      errors.push({ field: `items.${index}.taxRate`, message: "Tax rate cannot be negative." });
    }

    cleanedItems.push({ description, quantity, unitPrice, taxRate });
  });

  if (cleanedItems.length === 0) {
    errors.push({ field: "items", message: "At least one invoice item with a description is required." });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const currency = trimOrEmpty(body.currency).toUpperCase() || "USD";

  return {
    success: true,
    data: {
      clientId,
      invoiceNumber: trimOrNull(body.invoiceNumber),
      status: status as (typeof invoiceStatusValues)[number],
      issueDate,
      dueDate,
      currency,
      notes: trimOrNull(body.notes),
      terms: trimOrNull(body.terms),
      items: cleanedItems
    }
  };
}
