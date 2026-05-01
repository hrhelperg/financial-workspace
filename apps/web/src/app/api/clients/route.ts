import { NextResponse } from "next/server";
import { createClient, listClients } from "@/server/clients";
import { parseCreateClientPayload } from "@/server/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await listClients();
  return NextResponse.json({ data });
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

  const parsed = parseCreateClientPayload(payload);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }

  const created = await createClient(parsed.data);
  return NextResponse.json({ data: created }, { status: 201 });
}
