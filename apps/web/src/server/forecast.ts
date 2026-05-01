import "server-only";
import { eq, and } from "drizzle-orm";
import { db, financialForecasts, type FinancialForecast } from "@financial-workspace/db";
import { requireWorkspaceMember } from "./workspace";

export type ForecastInput = {
  year: number;
  expectedIncome: number;
  expectedExpenses: number;
  currency?: string;
};

export type ForecastView = {
  id: string | null;
  workspaceId: string;
  year: number;
  expectedIncome: string;
  expectedExpenses: string;
  currency: string;
  projectedNet: string;
};

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function validateForecastYear(year: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Year must be an integer between 2000 and 2100.");
  }
}

function validateAmount(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be greater than or equal to 0.`);
  }
}

function toMoney(value: number) {
  return value.toFixed(2);
}

function normalizeCurrency(value?: string) {
  const currency = value?.trim().toUpperCase() || "USD";
  return currency.slice(0, 12);
}

function toForecastView(workspaceId: string, year: number, forecast?: FinancialForecast): ForecastView {
  const expectedIncome = forecast?.expectedIncome ?? "0.00";
  const expectedExpenses = forecast?.expectedExpenses ?? "0.00";
  const projectedNet = Number(expectedIncome) - Number(expectedExpenses);

  return {
    id: forecast?.id ?? null,
    workspaceId,
    year,
    expectedIncome,
    expectedExpenses,
    currency: forecast?.currency ?? "USD",
    projectedNet: Number.isFinite(projectedNet) ? projectedNet.toFixed(2) : "0.00"
  };
}

async function assertCurrentWorkspace(workspaceId: string) {
  const { workspace } = await requireWorkspaceMember();

  if (workspace.id !== workspaceId) {
    throw new Error("Forecast does not belong to this workspace.");
  }

  return workspace.id;
}

async function readForecast(workspaceId: string, year: number) {
  validateForecastYear(year);

  const [forecast] = await db
    .select()
    .from(financialForecasts)
    .where(and(eq(financialForecasts.workspaceId, workspaceId), eq(financialForecasts.year, year)))
    .limit(1);

  return toForecastView(workspaceId, year, forecast);
}

export async function getForecast(workspaceId: string, year: number): Promise<ForecastView> {
  const scopedWorkspaceId = await assertCurrentWorkspace(workspaceId);
  return readForecast(scopedWorkspaceId, year);
}

export async function getCurrentWorkspaceForecast(year = getCurrentYear()): Promise<ForecastView> {
  const { workspace } = await requireWorkspaceMember();
  return readForecast(workspace.id, year);
}

async function writeForecast(workspaceId: string, input: ForecastInput) {
  validateForecastYear(input.year);
  validateAmount(input.expectedIncome, "Expected income");
  validateAmount(input.expectedExpenses, "Expected expenses");

  const now = new Date();
  const [forecast] = await db
    .insert(financialForecasts)
    .values({
      workspaceId,
      year: input.year,
      expectedIncome: toMoney(input.expectedIncome),
      expectedExpenses: toMoney(input.expectedExpenses),
      currency: normalizeCurrency(input.currency),
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: [financialForecasts.workspaceId, financialForecasts.year],
      set: {
        expectedIncome: toMoney(input.expectedIncome),
        expectedExpenses: toMoney(input.expectedExpenses),
        currency: normalizeCurrency(input.currency),
        updatedAt: now
      }
    })
    .returning();

  return toForecastView(workspaceId, input.year, forecast);
}

export async function upsertForecast(workspaceId: string, input: ForecastInput): Promise<ForecastView> {
  const scopedWorkspaceId = await assertCurrentWorkspace(workspaceId);
  return writeForecast(scopedWorkspaceId, input);
}

export async function upsertCurrentWorkspaceForecast(input: ForecastInput): Promise<ForecastView> {
  const { workspace } = await requireWorkspaceMember();
  return writeForecast(workspace.id, input);
}
