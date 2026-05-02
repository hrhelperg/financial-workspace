import Link from "next/link";
import { ArrowLeft, Save, TrendingUp } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { inputClassName, labelClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/form-styles";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatCurrency } from "@/server/format";
import { getCurrentWorkspaceForecast, getCurrentYear } from "@/server/forecast";
import { saveForecastAction } from "./actions";

type ForecastPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    year?: string;
  }>;
};

export const dynamic = "force-dynamic";

function parseYear(value: string | undefined) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : getCurrentYear();
}

function yearOptions(selectedYear: number) {
  const currentYear = getCurrentYear();
  const years = new Set<number>([selectedYear]);

  for (let year = currentYear - 2; year <= currentYear + 5; year += 1) {
    years.add(year);
  }

  return Array.from(years).sort((a, b) => a - b);
}

export default async function ForecastPage({ searchParams }: ForecastPageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const selectedYear = parseYear(params.year);
  const forecast = await getCurrentWorkspaceForecast(selectedYear);
  const options = yearOptions(selectedYear);

  return (
    <div className="space-y-6">
      <Link
        href={localizePath("/cashflow", locale)}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#58645d] hover:text-[#1f2933]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("common.back.cashflow")}
      </Link>

      <PageHeader
        eyebrow={t("cashflow.eyebrow")}
        title={t("forecast.title")}
        description={t("forecast.description")}
        actionLabel={t("cashflow.title")}
        actionIcon={TrendingUp}
        actionHref={localizePath("/cashflow", locale)}
      />

      {params.error ? (
        <p className="rounded-md border border-[#f0c4c4] bg-[#ffe7e7] px-3 py-2 text-sm text-[#a13d3d]">
          {params.error}
        </p>
      ) : null}
      {params.saved ? (
        <p className="rounded-md border border-[#b8e2d8] bg-[#e1f3ef] px-3 py-2 text-sm text-[#0f5f59]">
          {t("forecast.saved")}
        </p>
      ) : null}

      <Panel>
        <PanelHeader title={t("forecast.selectYear")} description={t("forecast.selectYearDescription")} />
        <form
          action={localizePath("/cashflow/forecast", locale)}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
          method="get"
        >
          <label className={labelClassName}>
            {t("common.labels.year")}
            <select className={`${inputClassName} sm:w-44`} defaultValue={selectedYear} name="year">
              {options.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <button className={secondaryButtonClassName} type="submit">
            {t("common.actions.viewYear")}
          </button>
        </form>
      </Panel>

      <Panel>
        <PanelHeader
          title={t("forecast.forecastTitle", { year: forecast.year })}
          description={t("forecast.forecastDescription")}
        />
        <form action={saveForecastAction} className="mt-5 space-y-5">
          <input name="locale" type="hidden" value={locale} />
          <input name="year" type="hidden" value={forecast.year} />
          <input name="currency" type="hidden" value={forecast.currency} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClassName}>
              {t("forecast.expectedIncome")}
              <input
                className={inputClassName}
                defaultValue={forecast.expectedIncome}
                min="0"
                name="expectedIncome"
                required
                step="0.01"
                type="number"
              />
            </label>
            <label className={labelClassName}>
              {t("forecast.expectedExpenses")}
              <input
                className={inputClassName}
                defaultValue={forecast.expectedExpenses}
                min="0"
                name="expectedExpenses"
                required
                step="0.01"
                type="number"
              />
            </label>
          </div>

          <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4">
            <dl className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-[#647067]">{t("forecast.expectedIncome")}</dt>
                <dd className="mt-1 font-semibold text-[#1f2933]">
                  {formatCurrency(forecast.expectedIncome, forecast.currency, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-[#647067]">{t("forecast.expectedExpenses")}</dt>
                <dd className="mt-1 font-semibold text-[#1f2933]">
                  {formatCurrency(forecast.expectedExpenses, forecast.currency, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-[#647067]">{t("forecast.projectedNet")}</dt>
                <dd className="mt-1 font-semibold text-[#1f2933]">
                  {formatCurrency(forecast.projectedNet, forecast.currency, locale)}
                </dd>
              </div>
            </dl>
          </div>

          <button className={primaryButtonClassName} type="submit">
            <Save className="h-4 w-4" aria-hidden="true" />
            {t("forecast.save")}
          </button>
        </form>
      </Panel>
    </div>
  );
}
