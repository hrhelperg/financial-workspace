import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import {
  auditLogs,
  clients,
  db,
  expenses,
  expenseCategories,
  financialForecasts,
  invoiceItems,
  invoices,
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
  seededClientId?: string;
  seededExpenseIds?: string[];
  seededForecastYear?: number;
  seededInvoiceIds?: string[];
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

function dateInCurrentYear(month: number, day: number) {
  const year = new Date().getFullYear();
  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    year
  };
}

function buildInvoiceStoragePath(input: {
  workspaceId: string;
  fiscalYear: number;
  direction: "incoming" | "outgoing";
  invoiceId: string;
}) {
  return `workspaces/${input.workspaceId}/fiscal/${input.fiscalYear}/${input.direction}/invoices/${input.invoiceId}.pdf`;
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

    const categoryRows =
      config.expenseCategories.length > 0
        ? await tx
            .select({
              id: expenseCategories.id,
              name: expenseCategories.name
            })
            .from(expenseCategories)
            .where(
              and(
                eq(expenseCategories.workspaceId, workspaceId),
                inArray(expenseCategories.name, config.expenseCategories.map((category) => category.name))
              )
            )
        : [];
    const categoryIdByName = new Map(categoryRows.map((category) => [category.name, category.id]));

    const [existingSeedClient] = await tx
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.workspaceId, workspaceId), eq(clients.name, "Northstar Studio")))
      .limit(1);

    const [seedClient] = existingSeedClient
      ? [existingSeedClient]
      : await tx
          .insert(clients)
          .values({
            workspaceId,
            ownerUserId: user.id,
            name: "Northstar Studio",
            companyName: "Northstar Studio",
            email: "finance@northstar.example",
            status: "active",
            notes: "Sample client from the Freelancer Finance Dashboard template.",
            metadata: {
              source: "template_seed",
              template_slug: template.slug
            }
          })
          .returning({ id: clients.id });

    const invoiceSeedData = [
      {
        invoiceNumber: "CW-DEMO-001",
        direction: "incoming" as const,
        status: "sent" as const,
        issue: dateInCurrentYear(1, 12),
        due: dateInCurrentYear(1, 26),
        description: "Brand strategy sprint",
        unitPrice: "2400.00",
        taxAmount: "0.00",
        totalAmount: "2400.00",
        amountPaid: "0.00"
      },
      {
        invoiceNumber: "CW-DEMO-002",
        direction: "incoming" as const,
        status: "paid" as const,
        issue: dateInCurrentYear(2, 8),
        due: dateInCurrentYear(2, 22),
        description: "Monthly advisory retainer",
        unitPrice: "1800.00",
        taxAmount: "0.00",
        totalAmount: "1800.00",
        amountPaid: "1800.00"
      },
      {
        invoiceNumber: "CW-DEMO-003",
        direction: "outgoing" as const,
        status: "draft" as const,
        issue: dateInCurrentYear(3, 4),
        due: dateInCurrentYear(3, 18),
        description: "Contractor design support",
        unitPrice: "650.00",
        taxAmount: "0.00",
        totalAmount: "650.00",
        amountPaid: "0.00"
      }
    ];
    const seededInvoiceIds: string[] = [];

    for (const seed of invoiceSeedData) {
      const invoiceId = randomUUID();
      const [createdInvoice] = await tx
        .insert(invoices)
        .values({
          id: invoiceId,
          workspaceId,
          clientId: seedClient.id,
          invoiceNumber: seed.invoiceNumber,
          direction: seed.direction,
          status: seed.status,
          issueDate: seed.issue.date,
          dueDate: seed.due.date,
          fiscalYear: seed.issue.year,
          storagePath: buildInvoiceStoragePath({
            workspaceId,
            fiscalYear: seed.issue.year,
            direction: seed.direction,
            invoiceId
          }),
          subtotalAmount: seed.unitPrice,
          taxAmount: seed.taxAmount,
          totalAmount: seed.totalAmount,
          amountPaid: seed.amountPaid,
          currency: config.invoiceDefaults?.currency ?? config.workspace.baseCurrency ?? "USD",
          notes: "Sample invoice from the Freelancer Finance Dashboard template.",
          terms: `Net ${config.invoiceDefaults?.paymentTermsDays ?? 14}`,
          sentAt: seed.status === "sent" ? new Date() : null,
          paidAt: seed.status === "paid" ? new Date() : null,
          metadata: {
            source: "template_seed",
            template_slug: template.slug
          }
        })
        .onConflictDoNothing({ target: [invoices.workspaceId, invoices.invoiceNumber] })
        .returning({ id: invoices.id });

      if (!createdInvoice) {
        continue;
      }

      seededInvoiceIds.push(createdInvoice.id);
      await tx.insert(invoiceItems).values({
        workspaceId,
        invoiceId: createdInvoice.id,
        description: seed.description,
        quantity: "1.00",
        unitPrice: seed.unitPrice,
        taxRate: "0.00",
        taxAmount: seed.taxAmount,
        lineTotal: seed.totalAmount,
        sortOrder: 0,
        metadata: {
          source: "template_seed",
          template_slug: template.slug
        }
      });
    }

    const expenseSeedData = [
      {
        vendor: "Figma",
        categoryName: "Software & SaaS",
        description: "Design subscription",
        amount: "96.00",
        date: dateInCurrentYear(1, 18).date,
        status: "paid" as const
      },
      {
        vendor: "Vercel",
        categoryName: "Software & SaaS",
        description: "Hosting and deployment",
        amount: "120.00",
        date: dateInCurrentYear(2, 3).date,
        status: "paid" as const
      },
      {
        vendor: "Local Coworking",
        categoryName: "Office",
        description: "Monthly workspace pass",
        amount: "310.00",
        date: dateInCurrentYear(2, 12).date,
        status: "approved" as const
      },
      {
        vendor: "Accountant",
        categoryName: "Professional services",
        description: "Quarterly bookkeeping review",
        amount: "450.00",
        date: dateInCurrentYear(3, 8).date,
        status: "submitted" as const
      },
      {
        vendor: "Portfolio Ads",
        categoryName: "Marketing",
        description: "Lead generation campaign",
        amount: "275.00",
        date: dateInCurrentYear(3, 15).date,
        status: "approved" as const
      }
    ];
    const seededExpenseIds: string[] = [];

    for (const seed of expenseSeedData) {
      const [existingExpense] = await tx
        .select({ id: expenses.id })
        .from(expenses)
        .where(
          and(
            eq(expenses.workspaceId, workspaceId),
            eq(expenses.vendor, seed.vendor),
            eq(expenses.expenseDate, seed.date),
            eq(expenses.amount, seed.amount)
          )
        )
        .limit(1);

      if (existingExpense) {
        continue;
      }

      const [createdExpense] = await tx
        .insert(expenses)
        .values({
          workspaceId,
          categoryId: categoryIdByName.get(seed.categoryName) ?? null,
          submittedByUserId: user.id,
          vendor: seed.vendor,
          description: seed.description,
          amount: seed.amount,
          currency: config.workspace.baseCurrency ?? "USD",
          expenseDate: seed.date,
          status: seed.status,
          metadata: {
            source: "template_seed",
            template_slug: template.slug
          }
        })
        .returning({ id: expenses.id });

      if (createdExpense) {
        seededExpenseIds.push(createdExpense.id);
      }
    }

    const currentYear = new Date().getFullYear();
    const expectedIncome = config.forecast?.expectedMonthlyIncome
      ? (config.forecast.expectedMonthlyIncome * 12).toFixed(2)
      : "96000.00";
    const expectedExpenses = config.forecast?.expectedMonthlyExpenses
      ? (config.forecast.expectedMonthlyExpenses * 12).toFixed(2)
      : "42000.00";
    const [seededForecast] = await tx
      .insert(financialForecasts)
      .values({
        workspaceId,
        year: currentYear,
        expectedIncome,
        expectedExpenses,
        currency: config.workspace.baseCurrency ?? "USD"
      })
      .onConflictDoNothing({ target: [financialForecasts.workspaceId, financialForecasts.year] })
      .returning({ year: financialForecasts.year });

    const result: TemplateInstallResultPayload = {
      expenseCategoryIds: categoryRows.map((row) => row.id),
      seededClientId: seedClient.id,
      seededExpenseIds,
      seededForecastYear: seededForecast?.year ?? currentYear,
      seededInvoiceIds
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
        seeded_expense_categories: seededCategories.length,
        seeded_expenses: seededExpenseIds.length,
        seeded_forecast_year: seededForecast?.year ?? null,
        seeded_invoices: seededInvoiceIds.length
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
