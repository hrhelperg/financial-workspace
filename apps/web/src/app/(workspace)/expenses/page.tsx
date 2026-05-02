import { Plus } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { inputClassName, labelClassName, primaryButtonClassName } from "@/components/form-styles";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";
import { getI18n } from "@/i18n/server";
import { listExpenseCategories, listExpenses } from "@/server/expenses";
import { formatCurrency, formatDate } from "@/server/format";
import { createGuidedExpenseAction } from "./actions";

type ExpensesPageProps = {
  searchParams: Promise<{
    error?: string;
    guided?: string;
  }>;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const [expenseRows, categories] = await Promise.all([listExpenses(), listExpenseCategories()]);
  const showGuidedForm = params.guided === "expense";
  const columns = [
    { key: "vendor", label: t("expenses.vendor") },
    { key: "category", label: t("expenses.category") },
    { key: "date", label: t("expenses.date") },
    { key: "amount", label: t("common.labels.amount"), align: "right" as const },
    { key: "status", label: t("common.labels.status") }
  ];
  const rows = expenseRows.map((expense) => ({
    vendor: expense.vendor,
    category: expense.categoryName ?? t("expenses.uncategorized"),
    date: formatDate(expense.expenseDate, locale),
    amount: formatCurrency(expense.amount, expense.currency, locale),
    status: t(`expenses.status.${expense.status}`)
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("expenses.eyebrow")}
        title={t("expenses.title")}
        description={t("expenses.description")}
        actionLabel={t("expenses.add")}
        actionIcon={Plus}
      />
      {showGuidedForm ? (
        <Panel>
          <PanelHeader title={t("expenses.guidedTitle")} description={t("expenses.guidedDescription")} />
          {params.error ? (
            <p className="mt-4 rounded-md border border-[#f0c4c4] bg-[#ffe7e7] px-3 py-2 text-sm text-[#a13d3d]">
              {params.error}
            </p>
          ) : null}
          <form action={createGuidedExpenseAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <input name="locale" type="hidden" value={locale} />
            <input name="currency" type="hidden" value="USD" />
            <label className={labelClassName}>
              {t("expenses.vendor")}
              <input className={inputClassName} defaultValue="Figma" name="vendor" required />
            </label>
            <label className={labelClassName}>
              {t("expenses.category")}
              <select className={inputClassName} name="categoryId" defaultValue={categories[0]?.id ?? ""}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClassName}>
              {t("expenses.date")}
              <input className={inputClassName} defaultValue={todayIso()} name="expenseDate" required type="date" />
            </label>
            <label className={labelClassName}>
              {t("common.labels.amount")}
              <input className={inputClassName} defaultValue="96.00" min="0.01" name="amount" required step="0.01" type="number" />
            </label>
            <label className={`${labelClassName} md:col-span-2`}>
              {t("common.labels.notes")}
              <textarea
                className={`${inputClassName} min-h-24 resize-y`}
                defaultValue="Design subscription added from the onboarding checklist."
                name="description"
              />
            </label>
            <div className="md:col-span-2">
              <button className={primaryButtonClassName} type="submit">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("expenses.saveGuided")}
              </button>
            </div>
          </form>
        </Panel>
      ) : null}
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
