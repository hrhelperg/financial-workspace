import { NextResponse } from "next/server";
import { getApiTranslator } from "@/server/api-i18n";
import { createClient, listClients } from "@/server/clients";
import type { Translator } from "@/i18n/messages";
import { isAuthenticationError, isAuthorizationError } from "@/server/workspace";
import { parseCreateClientPayload } from "@/server/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const t = getApiTranslator(request);

  try {
    const data = await listClients();
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

  const parsed = parseCreateClientPayload(payload, t);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  try {
    const created = await createClient(parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
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

  const message = error instanceof Error ? error.message : t("common.errors.requestFailed");
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
