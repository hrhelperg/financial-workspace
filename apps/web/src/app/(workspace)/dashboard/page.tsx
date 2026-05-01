import { BriefcaseBusiness, CheckCircle2, Clock3, DollarSign, ReceiptText, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  cashOutlook,
  dashboardMetrics,
  operatingFocus,
  recentActivity,
  type DashboardMetricIcon
} from "@financial-workspace/core";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";

const metricIcons: Record<DashboardMetricIcon, LucideIcon> = {
  clients: BriefcaseBusiness,
  dollar: DollarSign,
  invoices: ReceiptText,
  overdue: Timer
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Financial control center"
        description="A workspace view of receivables, payments, expenses, cashflow, documents, and automation readiness."
        actionLabel="New invoice"
        actionIcon={ReceiptText}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            note={metric.note}
            icon={metricIcons[metric.icon]}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">Recent activity</h2>
              <p className="mt-1 text-sm text-[#647067]">Latest records across the workspace.</p>
            </div>
            <Clock3 className="h-5 w-5 text-[#0f766e]" aria-hidden="true" />
          </div>
          <div className="mt-5 divide-y divide-[#edf1ec]">
            {recentActivity.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#1f2933]">{item.label}</p>
                  <p className="mt-1 text-sm text-[#647067]">{item.meta}</p>
                </div>
                <span className="text-sm font-semibold text-[#1f2933]">{item.amount}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">Cash outlook</h2>
          <div className="mt-5 space-y-4">
            {cashOutlook.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#58645d]">{item.label}</span>
                  <span className="font-semibold text-[#1f2933]">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#edf1ec]">
                  <div className={`${item.colorClassName} h-2 rounded-full`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <PanelHeader
            title="Workspace priorities"
            description="Built around financial operations, not a single billing workflow."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {operatingFocus.map((item) => (
              <div
                key={item}
                className="flex min-h-16 items-start gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
                <span className="text-sm font-medium leading-5 text-[#1f2933]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
