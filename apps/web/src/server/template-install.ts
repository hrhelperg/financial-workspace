import "server-only";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  auditLogs,
  db,
  expenseCategories,
  templateInstalls,
  templateVersions,
  templates,
  type ExpenseCategory,
  type Template,
  type TemplateInstall,
  type TemplateVersion
} from "@financial-workspace/db";
import { parseTemplateConfig, type TemplateConfigV1 } from "@financial-workspace/core/templates";
import { requireWorkspaceRole } from "./workspace";

export class TemplateNotFoundError extends Error {
  constructor(slug: string) {
    super(`Template not found: ${slug}`);
    this.name = "TemplateNotFoundError";
  }
}

export class TemplateConfigInvalidError extends Error {
  readonly errors: ReadonlyArray<{ field: string; message: string }>;
  constructor(errors: ReadonlyArray<{ field: string; message: string }>) {
    super("Template config failed validation.");
    this.name = "TemplateConfigInvalidError";
    this.errors = errors;
  }
}

export class TemplateInstallIdempotencyConflictError extends Error {
  constructor() {
    super("Idempotency key reused with a different install request.");
    this.name = "TemplateInstallIdempotencyConflictError";
  }
}

export function isTemplateNotFoundError(error: unknown) {
  return error instanceof TemplateNotFoundError;
}

export function isTemplateConfigInvalidError(error: unknown) {
  return error instanceof TemplateConfigInvalidError;
}

export function isTemplateInstallIdempotencyConflictError(error: unknown) {
  return error instanceof TemplateInstallIdempotencyConflictError;
}

export type InstallTemplateInput = {
  slug: string;
  workspaceId: string;
  idempotencyKey: string;
};

export type TemplateInstallResultPayload = {
  expenseCategoryIds: string[];
};

export type InstallTemplateOutput = {
  install: TemplateInstall;
  template: Template;
  templateVersion: TemplateVersion;
  result: TemplateInstallResultPayload;
  replayed: boolean;
};

function hashInstallRequest(input: {
  templateId: string;
  templateVersionId: string;
  workspaceId: string;
}): string {
  return createHash("sha256")
    .update(JSON.stringify({
      templateId: input.templateId,
      templateVersionId: input.templateVersionId,
      workspaceId: input.workspaceId
    }))
    .digest("hex");
}

async function loadPublishedTemplate(slug: string) {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);

  if (!template || template.deletedAt || template.visibility !== "public") {
    return null;
  }
  return template;
}

async function loadLatestPublishedVersion(templateId: string) {
  const [version] = await db
    .select()
    .from(templateVersions)
    .where(and(eq(templateVersions.templateId, templateId), eq(templateVersions.isLatest, true)))
    .limit(1);

  if (!version || !version.publishedAt) {
    return null;
  }
  return version;
}

async function findExistingInstall(workspaceId: string, idempotencyKey: string) {
  const [existing] = await db
    .select()
    .from(templateInstalls)
    .where(
      and(
        eq(templateInstalls.workspaceId, workspaceId),
        eq(templateInstalls.idempotencyKey, idempotencyKey)
      )
    )
    .limit(1);
  return existing ?? null;
}

function isInstallResultPayload(value: unknown): value is TemplateInstallResultPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { expenseCategoryIds?: unknown };
  return (
    Array.isArray(candidate.expenseCategoryIds) &&
    candidate.expenseCategoryIds.every((id) => typeof id === "string")
  );
}

export async function installTemplate(input: InstallTemplateInput): Promise<InstallTemplateOutput> {
  const idempotencyKey = input.idempotencyKey.trim();
  if (idempotencyKey.length === 0) {
    throw new Error("idempotencyKey is required.");
  }

  const { user, workspace } = await requireWorkspaceRole(["admin"]);
  if (workspace.id !== input.workspaceId) {
    throw new Error("Active workspace does not match install target.");
  }
  const workspaceId = workspace.id;

  const template = await loadPublishedTemplate(input.slug);
  if (!template) {
    throw new TemplateNotFoundError(input.slug);
  }

  const version = await loadLatestPublishedVersion(template.id);
  if (!version) {
    throw new TemplateNotFoundError(input.slug);
  }

  const parsed = parseTemplateConfig(version.config);
  if (!parsed.success) {
    throw new TemplateConfigInvalidError(parsed.errors);
  }
  const config: TemplateConfigV1 = parsed.config;
  const requestHash = hashInstallRequest({
    templateId: template.id,
    templateVersionId: version.id,
    workspaceId
  });

  const existing = await findExistingInstall(workspaceId, idempotencyKey);
  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new TemplateInstallIdempotencyConflictError();
    }
    if (existing.status === "completed" && isInstallResultPayload(existing.result)) {
      return {
        install: existing,
        template,
        templateVersion: version,
        result: existing.result,
        replayed: true
      };
    }
  }

  return db.transaction(async (tx) => {
    const [install] = await tx
      .insert(templateInstalls)
      .values({
        workspaceId,
        templateId: template.id,
        templateVersionId: version.id,
        installedByUserId: user.id,
        idempotencyKey,
        requestHash,
        status: "pending"
      })
      .returning();

    let seededCategories: ExpenseCategory[] = [];
    if (config.expenseCategories.length > 0) {
      seededCategories = await tx
        .insert(expenseCategories)
        .values(
          config.expenseCategories.map((category) => ({
            workspaceId,
            name: category.name,
            type: category.type,
            description: category.description ?? null,
            taxCode: category.taxCode ?? null
          }))
        )
        .onConflictDoNothing({ target: [expenseCategories.workspaceId, expenseCategories.name] })
        .returning();
    }

    const result: TemplateInstallResultPayload = {
      expenseCategoryIds: seededCategories.map((row) => row.id)
    };

    const [completed] = await tx
      .update(templateInstalls)
      .set({
        status: "completed",
        result,
        installedAt: new Date()
      })
      .where(eq(templateInstalls.id, install.id))
      .returning();

    await tx.insert(auditLogs).values({
      workspaceId,
      actorUserId: user.id,
      action: "create",
      entityType: "template_install",
      entityId: completed.id,
      metadata: {
        template_slug: template.slug,
        template_version: version.version,
        seeded_expense_categories: seededCategories.length
      }
    });

    return {
      install: completed,
      template,
      templateVersion: version,
      result,
      replayed: false
    };
  });
}
