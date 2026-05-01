import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";

const weeks = [
  { label: "This week", inflow: "$9,600", outflow: "$2,300", net: "$7,300" },
  { label: "Next week", inflow: "$14,250", outflow: "$3,180", net: "$11,070" },
  { label: "Week 3", inflow: "$8,400", outflow: "$2,760", net: "$5,640" },
  { label: "Week 4", inflow: "$4,650", outflow: "$4,190", net: "$460" }
];

export default function CashflowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Forecast"
        title="Cashflow"
        description="Thirty-day outlook with $24,470 projected net movement."
        actionLabel="Yearly forecast"
        actionIcon={CalendarDays}
        actionHref="/cashflow/forecast"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Projected inflow" value="$36,900" note="Next 30 days" icon={CalendarDays} tone="green" />
        <MetricCard title="Projected outflow" value="$12,430" note="Approved expenses" icon={CalendarDays} tone="amber" />
        <MetricCard title="Net movement" value="$24,470" note="Before tax reserves" icon={CalendarDays} tone="blue" />
      </div>

      <section className="rounded-md border border-[#d8ded8] bg-white p-5">
        <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">Four-week view</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {weeks.map((week) => (
            <div key={week.label} className="rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4">
              <p className="text-sm font-semibold text-[#1f2933]">{week.label}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#647067]">In</dt>
                  <dd className="font-semibold text-[#0f766e]">{week.inflow}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#647067]">Out</dt>
                  <dd className="font-semibold text-[#a66300]">{week.outflow}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#edf1ec] pt-2">
                  <dt className="text-[#647067]">Net</dt>
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
