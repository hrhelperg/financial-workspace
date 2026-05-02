import { NextResponse } from "next/server";
import { getApiTranslator } from "@/server/api-i18n";
import type { Translator } from "@/i18n/messages";
import { createInvoice, isIdempotencyConflictError, listInvoices } from "@/server/invoices";
import { isAuthenticationError, isAuthorizationError } from "@/server/workspace";
import { parseCreateInvoicePayload } from "@/server/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const t = getApiTranslator(request);

  try {
    const data = await listInvoices();
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error, t);
  }
}

export async function POST(request: Request) {
  const t = getApiTranslator(request);
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ field: "_", message: t("common.errors.invalidJson") }] },
      { status: 400 }
    );
  }

  const parsed = parseCreateInvoicePayload(payload, t);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  const idempotencyKey = request.headers.get("idempotency-key");

  try {
    const created = await createInvoice(parsed.data, { idempotencyKey });
    const status = created.replayed ? 200 : 201;
    return NextResponse.json({ data: created }, { status });
  } catch (error) {
    return handleApiError(error, t);
  }
}

function handleApiError(error: unknown, t: Translator) {
  if (isAuthenticationError(error)) {
    return NextResponse.json({ errors: [{ field: "_", message: t("common.errors.authenticationRequired") }] }, { status: 401 });
  }

  if (isAuthorizationError(error)) {
    return NextResponse.json({ errors: [{ field: "_", message: t("common.errors.insufficientRole") }] }, { status: 403 });
  }

  if (isIdempotencyConflictError(error)) {
    return NextResponse.json(
      { errors: [{ field: "_", message: t("common.errors.idempotencyConflict") }] },
      { status: 409 }
    );
  }

  const message = error instanceof Error ? error.message : t("invoices.createFailed");
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
