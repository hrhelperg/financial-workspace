"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentYear, upsertCurrentWorkspaceForecast } from "@/server/forecast";

function toNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function saveForecastAction(formData: FormData) {
  const year = toNumber(formData.get("year"));
  const expectedIncome = toNumber(formData.get("expectedIncome"));
  const expectedExpenses = toNumber(formData.get("expectedExpenses"));
  const currency = String(formData.get("currency") ?? "USD");
  let redirectTo = `/cashflow/forecast?year=${Number.isInteger(year) ? year : getCurrentYear()}`;

  try {
    await upsertCurrentWorkspaceForecast({
      year,
      expectedIncome,
      expectedExpenses,
      currency
    });
    revalidatePath("/cashflow/forecast");
    revalidatePath("/dashboard");
    redirectTo = `/cashflow/forecast?year=${year}&saved=1`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save forecast.";
    redirectTo = `${redirectTo}&error=${encodeURIComponent(message)}`;
  }

  redirect(redirectTo);
}
