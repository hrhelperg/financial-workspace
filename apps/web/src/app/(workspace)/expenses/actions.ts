"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { createExpense } from "@/server/expenses";

function pickString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function pickLocale(value: FormDataEntryValue | null) {
  const locale = pickString(value);
  return isLocale(locale) ? locale : defaultLocale;
}

export async function createGuidedExpenseAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const amount = Number(pickString(formData.get("amount")));

  try {
    await createExpense({
      vendor: pickString(formData.get("vendor")),
      categoryId: pickString(formData.get("categoryId")) || null,
      description: pickString(formData.get("description")) || null,
      amount,
      currency: pickString(formData.get("currency")) || "USD",
      expenseDate: pickString(formData.get("expenseDate")),
      status: "draft"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create expense.";
    const params = new URLSearchParams({
      error: message,
      guided: "expense"
    });
    redirect(`${localizePath("/expenses", locale)}?${params.toString()}`);
  }

  redirect(`${localizePath("/dashboard", locale)}?onboarded=expense`);
}
