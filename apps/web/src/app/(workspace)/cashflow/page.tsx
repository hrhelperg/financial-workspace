import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

const weeks = [
  { labelKey: "cashflow.thisWeek", inflow: "$9,600", outflow: "$2,300", net: "$7,300" },
  { labelKey: "cashflow.nextWeek", inflow: "$14,250", outflow: "$3,180", net: "$11,070" },
  { labelKey: "cashflow.weekThree", inflow: "$8,400", outflow: "$2,760", net: "$5,640" },
  { labelKey: "cashflow.weekFour", inflow: "$4,650", outflow: "$4,190", net: "$460" }
] as const;

export default async function CashflowPage() {
  const { locale, t } = await getI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("cashflow.eyebrow")}
        title={t("cashflow.title")}
        description={t("cashflow.description")}
        actionLabel={t("cashflow.yearlyForecast")}
        actionIcon={CalendarDays}
        actionHref={localizePath("/cashflow/forecast", locale)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={t("cashflow.projectedInflow")}
          value="$36,900"
          note={t("cashflow.nextThirtyDays")}
          icon={CalendarDays}
          tone="green"
        />
        <MetricCard
          title={t("cashflow.projectedOutflow")}
          value="$12,430"
          note={t("cashflow.approvedExpenses")}
          icon={CalendarDays}
          tone="amber"
        />
        <MetricCard
          title={t("cashflow.netMovement")}
          value="$24,470"
          note={t("cashflow.beforeTaxReserves")}
          icon={CalendarDays}
          tone="blue"
        />
      </div>

      <section className="rounded-md border border-[#d8ded8] bg-white p-5">
        <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">{t("cashflow.fourWeekView")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {weeks.map((week) => (
            <div key={week.labelKey} className="rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4">
              <p className="text-sm font-semibold text-[#1f2933]">{t(week.labelKey)}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#647067]">{t("cashflow.in")}</dt>
                  <dd className="font-semibold text-[#0f766e]">{week.inflow}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#647067]">{t("cashflow.out")}</dt>
                  <dd className="font-semibold text-[#a66300]">{week.outflow}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#edf1ec] pt-2">
                  <dt className="text-[#647067]">{t("cashflow.net")}</dt>
                  <dd className="font-semibold text-[#1f2933]">{week.net}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
