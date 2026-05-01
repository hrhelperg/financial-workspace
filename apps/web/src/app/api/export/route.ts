import { NextResponse } from "next/server";
import { exportFiscalPackage } from "@/server/fiscal-export";
import { isAuthenticationError, isAuthorizationError } from "@/server/workspace";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = Number(url.searchParams.get("year"));

  if (!Number.isInteger(year) || year < 1970 || year > 3000) {
    return NextResponse.json(
      { errors: [{ field: "year", message: "A valid fiscal year is required." }] },
      { status: 400 }
    );
  }

  try {
    const fiscalPackage = await exportFiscalPackage(year);

    return new Response(fiscalPackage.stream, {
      headers: {
        "content-disposition": `attachment; filename="${fiscalPackage.fileName}"`,
        "content-type": "application/zip"
      }
    });
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

  const message = error instanceof Error ? error.message : "Failed to export fiscal package.";
  return NextResponse.json({ errors: [{ field: "_", message }] }, { status: 400 });
}
