"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTranslator } from "@/i18n/messages";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { getCurrentYear, upsertCurrentWorkspaceForecast } from "@/server/forecast";

function toNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function saveForecastAction(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = createTranslator(locale);
  const year = toNumber(formData.get("year"));
  const expectedIncome = toNumber(formData.get("expectedIncome"));
  const expectedExpenses = toNumber(formData.get("expectedExpenses"));
  const currency = String(formData.get("currency") ?? "USD");
  const fallbackYear = Number.isInteger(year) ? year : getCurrentYear();
  let redirectTo = localizePath(`/cashflow/forecast?year=${fallbackYear}`, locale);

  try {
    await upsertCurrentWorkspaceForecast({
      year,
      expectedIncome,
      expectedExpenses,
      currency
    });
    revalidatePath("/cashflow/forecast");
    revalidatePath("/dashboard");
    redirectTo = localizePath(`/cashflow/forecast?year=${year}&saved=1`, locale);
  } catch (error) {
    const message = error instanceof Error ? error.message : t("forecast.saveFailed");
    redirectTo = `${redirectTo}&error=${encodeURIComponent(message)}`;
  }

  redirect(redirectTo);
}
