import { NextResponse } from "next/server";
import { createInvoice, isIdempotencyConflictError, listInvoices } from "@/server/invoices";
import { isAuthenticationError, isAuthorizationError } from "@/server/workspace";
import { parseCreateInvoicePayload } from "@/server/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listInvoices();
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ field: "_", message: "Invalid JSON body." }] },
      { status: 400 }
    );
  }

  const parsed = parseCreateInvoicePayload(payload);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  const idempotencyKey = request.headers.get("idempotency-key");

  try {
    const created = await createInvoice(parsed.data, { idempotencyKey });
    const status = created.replayed ? 200 : 201;
    return NextResponse.json({ data: created }, { status });
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

  if (isIdempotencyConflictError(error)) {
    return NextResponse.json(
      { errors: [{ field: "_", message: "Idempotency-Key already used with a different request body." }] },
      { status: 409 }
    );
  }

  const message = error instanceof Error ? error.message : "Failed to create invoice.";
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
