import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, expenses, expenseCategories, type Expense } from "@financial-workspace/db";
import { requireWorkspaceMember, requireWorkspaceRole } from "./workspace";

export type ExpenseListItem = {
  id: string;
  vendor: string;
  categoryName: string | null;
  expenseDate: string;
  amount: string;
  currency: string;
  status: Expense["status"];
};

export type ExpenseCategoryOption = {
  id: string;
  name: string;
};

export type CreateExpenseInput = {
  vendor: string;
  categoryId?: string | null;
  description?: string | null;
  amount: number;
  currency?: string;
  expenseDate: string;
  status?: Expense["status"];
};

function toMoney(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function assertValidDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Expense date must be valid.");
  }
}

function normalizeCurrency(value?: string) {
  return (value?.trim().toUpperCase() || "USD").slice(0, 3);
}

export async function listExpenseCategories(): Promise<ExpenseCategoryOption[]> {
  const { workspace } = await requireWorkspaceMember();

  return db
    .select({
      id: expenseCategories.id,
      name: expenseCategories.name
    })
    .from(expenseCategories)
    .where(eq(expenseCategories.workspaceId, workspace.id))
    .orderBy(expenseCategories.name);
}

export async function listExpenses(): Promise<ExpenseListItem[]> {
  const { workspace } = await requireWorkspaceMember();

  return db
    .select({
      id: expenses.id,
      vendor: expenses.vendor,
      categoryName: expenseCategories.name,
      expenseDate: expenses.expenseDate,
      amount: expenses.amount,
      currency: expenses.currency,
      status: expenses.status
    })
    .from(expenses)
    .leftJoin(
      expenseCategories,
      and(eq(expenseCategories.id, expenses.categoryId), eq(expenseCategories.workspaceId, workspace.id))
    )
    .where(and(eq(expenses.workspaceId, workspace.id), isNull(expenses.deletedAt)))
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { user, workspace } = await requireWorkspaceRole(["member"]);
  const vendor = input.vendor.trim();

  if (!vendor) {
    throw new Error("Vendor is required.");
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  assertValidDate(input.expenseDate);

  let categoryId = input.categoryId?.trim() || null;
  if (categoryId) {
    const [category] = await db
      .select({ id: expenseCategories.id })
      .from(expenseCategories)
      .where(and(eq(expenseCategories.id, categoryId), eq(expenseCategories.workspaceId, workspace.id)))
      .limit(1);

    if (!category) {
      throw new Error("Expense category does not belong to this workspace.");
    }
  }

  const [created] = await db
    .insert(expenses)
    .values({
      workspaceId: workspace.id,
      categoryId,
      submittedByUserId: user.id,
      vendor,
      description: input.description?.trim() || null,
      amount: toMoney(input.amount),
      currency: normalizeCurrency(input.currency),
      expenseDate: input.expenseDate,
      status: input.status ?? "draft",
      metadata: {
        source: "onboarding"
      }
    })
    .returning();

  return created;
}
