import { NextResponse } from "next/server";
import { createInvoice, listInvoices } from "@/server/invoices";
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

  try {
    const created = await createInvoice(parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
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

  const message = error instanceof Error ? error.message : "Failed to create invoice.";
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
