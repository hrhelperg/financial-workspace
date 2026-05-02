import { NextResponse } from "next/server";
import { getApiTranslator } from "@/server/api-i18n";
import type { Translator } from "@/i18n/messages";
import { updateInvoice } from "@/server/invoices";
import { isAuthenticationError, isAuthorizationError } from "@/server/workspace";
import { parseUpdateInvoicePayload } from "@/server/validation";

export const dynamic = "force-dynamic";

type InvoiceRouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function PATCH(request: Request, context: InvoiceRouteContext) {
  const t = getApiTranslator(request);
  const { invoiceId } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ field: "_", message: t("common.errors.invalidJson") }] },
      { status: 400 }
    );
  }

  const parsed = parseUpdateInvoicePayload(payload, t);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  try {
    const updated = await updateInvoice(invoiceId, parsed.data);
    return NextResponse.json({ data: updated });
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

  const message = error instanceof Error ? error.message : t("invoices.updateFailed");
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
