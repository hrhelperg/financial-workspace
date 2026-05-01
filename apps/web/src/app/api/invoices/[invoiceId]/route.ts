import { NextResponse } from "next/server";
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
  const { invoiceId } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ field: "_", message: "Invalid JSON body." }] },
      { status: 400 }
    );
  }

  const parsed = parseUpdateInvoicePayload(payload);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  try {
    const updated = await updateInvoice(invoiceId, parsed.data);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

function handleApiError(error: unknown) {
  if (isAuthenticationError(error)) {
    return NextResponse.json({ errors: [{ field: "_", message: "Authentication required." }] }, { status: 401 });
  }

  if (isAuthorizationError(error)) {
    return NextResponse.json({ errors: [{ field: "_", message: "Insufficient workspace role." }] }, { status: 403 });
  }

  const message = error instanceof Error ? error.message : "Failed to update invoice.";
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
