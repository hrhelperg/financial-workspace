"use server";

import { redirect } from "next/navigation";
import { localizePath, defaultLocale, isLocale, type Locale } from "@/i18n/config";
import {
  installTemplate,
  isTemplateConfigInvalidError,
  isTemplateInstallIdempotencyConflictError,
  isTemplateNotFoundError
} from "@/server/template-install";
import {
  isAuthenticationError,
  isAuthorizationError
} from "@/server/workspace";

function pickLocale(value: FormDataEntryValue | null): Locale {
  return typeof value === "string" && isLocale(value) ? value : defaultLocale;
}

function pickString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildErrorRedirect(slug: string, locale: Locale, errorKey: string): never {
  const params = new URLSearchParams({ error: errorKey });
  redirect(`${localizePath(`/templates/${encodeURIComponent(slug)}/install`, locale)}?${params.toString()}`);
}

export async function installTemplateAction(formData: FormData) {
  const slug = pickString(formData.get("slug"));
  const workspaceId = pickString(formData.get("workspaceId"));
  const idempotencyKey = pickString(formData.get("idempotencyKey"));
  const locale = pickLocale(formData.get("locale"));

  if (!slug || !workspaceId || !idempotencyKey) {
    buildErrorRedirect(slug || "unknown", locale, "errorGeneric");
  }

  try {
    await installTemplate({ slug, workspaceId, idempotencyKey });
  } catch (error) {
    if (isAuthenticationError(error)) {
      const next = `/templates/${encodeURIComponent(slug)}/install`;
      redirect(`${localizePath("/login", locale)}?next=${encodeURIComponent(next)}`);
    }
    if (isAuthorizationError(error)) {
      buildErrorRedirect(slug, locale, "errorRole");
    }
    if (isTemplateNotFoundError(error)) {
      buildErrorRedirect(slug, locale, "errorNotFound");
    }
    if (isTemplateConfigInvalidError(error)) {
      buildErrorRedirect(slug, locale, "errorInvalidConfig");
    }
    if (isTemplateInstallIdempotencyConflictError(error)) {
      buildErrorRedirect(slug, locale, "errorIdempotency");
    }
    buildErrorRedirect(slug, locale, "errorGeneric");
  }

  redirect(`${localizePath("/dashboard", locale)}?installed=${encodeURIComponent(slug)}`);
}
