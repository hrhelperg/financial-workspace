import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, templateVersions, templates, type TemplateVersion } from "@financial-workspace/db";
import {
  parseTemplateConfig,
  type TemplateConfigV1
} from "@financial-workspace/core/templates";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { MessageKey, Translator } from "@/i18n/messages";
import { getCurrentWorkspace } from "@/server/workspace";
import { installTemplateAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  }
};

type InstallPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

type LoadedTemplate = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  config: TemplateConfigV1;
  versionRow: TemplateVersion;
};

async function loadTemplate(slug: string): Promise<LoadedTemplate | null> {
  const [row] = await db
    .select({
      id: templates.id,
      slug: templates.slug,
      name: templates.name,
      tagline: templates.tagline,
      visibility: templates.visibility,
      deletedAt: templates.deletedAt,
      version: templateVersions
    })
    .from(templates)
    .innerJoin(
      templateVersions,
      and(eq(templateVersions.templateId, templates.id), eq(templateVersions.isLatest, true))
    )
    .where(eq(templates.slug, slug))
    .limit(1);

  if (!row || row.deletedAt || row.visibility !== "public") {
    return null;
  }
  if (!row.version.publishedAt) {
    return null;
  }

  const parsed = parseTemplateConfig(row.version.config);
  if (!parsed.success) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    config: parsed.config,
    versionRow: row.version
  };
}

const ERROR_KEY_MAP: Record<string, MessageKey> = {
  errorAuth: "templates.install.errorAuth",
  errorRole: "templates.install.errorRole",
  errorNotFound: "templates.install.errorNotFound",
  errorInvalidConfig: "templates.install.errorInvalidConfig",
  errorIdempotency: "templates.install.errorIdempotency",
  errorGeneric: "templates.install.errorGeneric"
};

function resolveErrorKey(t: Translator, errorParam?: string): string | null {
  if (!errorParam) return null;
  const messageKey = ERROR_KEY_MAP[errorParam] ?? "templates.install.errorGeneric";
  return t(messageKey);
}

export default async function InstallTemplatePage({ params, searchParams }: InstallPageProps) {
  const [{ locale, t }, { slug }, { error }] = await Promise.all([
    getI18n(),
    params,
    searchParams
  ]);

  const context = await getCurrentWorkspace();
  if (!context) {
    const next = `/templates/${encodeURIComponent(slug)}/install`;
    redirect(`${localizePath("/login", locale)}?next=${encodeURIComponent(next)}`);
  }

  const template = await loadTemplate(slug);
  if (!template) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#1f2933]">
        <section className="w-full max-w-md rounded-md border border-[#d8ded8] bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">{t("templates.install.errorTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-[#58645d]">{t("templates.install.errorNotFound")}</p>
          <Link
            href={localizePath("/", locale)}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#0f766e] hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {t("brand.name")}
          </Link>
        </section>
      </main>
    );
  }

  const idempotencyKey = `template:${template.slug}:workspace:${context.workspace.id}`;
  const expenseCount = template.config.expenseCategories.length;
  const folderCount = template.config.documentFolders.length;
  const widgetCount = template.config.dashboard.widgets.length;
  const forecastMonths = template.config.forecast?.horizonMonths;
  const errorMessage = resolveErrorKey(t, error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#1f2933]">
      <section className="w-full max-w-lg rounded-md border border-[#d8ded8] bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          {t("templates.install.title")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{template.name}</h1>
        {template.tagline ? (
          <p className="mt-2 text-sm leading-6 text-[#58645d]">{template.tagline}</p>
        ) : null}

        <div className="mt-6 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#647067]">
            {t("templates.install.describesWillCreate")}
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-[#1f2933]">
            <li>• {t("templates.install.expenseCategories", { count: expenseCount })}</li>
            <li>• {t("templates.install.documentFolders", { count: folderCount })}</li>
            <li>• {t("templates.install.dashboardWidgets", { count: widgetCount })}</li>
            {forecastMonths ? (
              <li>• {t("templates.install.forecastSkeleton", { months: forecastMonths })}</li>
            ) : null}
          </ul>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-md border border-[#ffd6de] bg-[#fff5f7] p-4 text-sm text-[#9f1239]">
            {errorMessage}
          </div>
        ) : null}

        <form className="mt-6 space-y-3" action={installTemplateAction}>
          <input type="hidden" name="slug" value={template.slug} />
          <input type="hidden" name="workspaceId" value={context.workspace.id} />
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          <input type="hidden" name="locale" value={locale} />

          <button
            type="submit"
            className="inline-flex w-full min-h-11 items-center justify-center rounded-md bg-[#1f2933] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
          >
            {t("templates.install.confirmCta", { workspace: context.workspace.name })}
          </button>
          <Link
            href={localizePath("/", locale)}
            className="inline-flex w-full min-h-10 items-center justify-center rounded-md border border-[#d8ded8] bg-white px-5 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
          >
            {t("templates.install.cancelCta")}
          </Link>
        </form>
      </section>
    </main>
  );
}
