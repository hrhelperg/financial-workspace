import { ArrowUpRight, CheckCircle2, Clock3, DollarSign, ReceiptText, WalletCards, Zap } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";

const activity = [
  { label: "Invoice FW-1024 sent", meta: "Acme Ledger Co.", amount: "$4,800" },
  { label: "Payment matched", meta: "Northstar Studio", amount: "$2,150" },
  { label: "Expense categorized", meta: "Cloud hosting", amount: "$382" },
  { label: "Document parsed", meta: "Consulting agreement", amount: "Ready" }
];

const operatingFocus = [
  "Collect receivables before they age",
  "Keep cashflow visible by week",
  "Link documents to clients and records",
  "Queue automations for repetitive finance tasks"
];

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
        <MetricCard title="Open AR" value="$48,220" note="+12.4% from last month" icon={DollarSign} tone="green" />
        <MetricCard title="Cash in 30d" value="$36,900" note="7 scheduled payments" icon={ArrowUpRight} tone="blue" />
        <MetricCard title="Expenses" value="$12,430" note="62% already reconciled" icon={WalletCards} tone="amber" />
        <MetricCard title="Automation queue" value="8 events" note="2 rules ready for Inngest" icon={Zap} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-md border border-[#d8ded8] bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">Recent activity</h2>
              <p className="mt-1 text-sm text-[#647067]">Latest records across the workspace.</p>
            </div>
            <Clock3 className="h-5 w-5 text-[#0f766e]" aria-hidden="true" />
          </div>
          <div className="mt-5 divide-y divide-[#edf1ec]">
            {activity.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-[#1f2933]">{item.label}</p>
                  <p className="mt-1 text-sm text-[#647067]">{item.meta}</p>
                </div>
                <span className="text-sm font-semibold text-[#1f2933]">{item.amount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[#d8ded8] bg-white p-5">
          <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">Cash outlook</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: "Expected", value: "74%", color: "bg-[#0f766e]" },
              { label: "At risk", value: "18%", color: "bg-[#d97706]" },
              { label: "Overdue", value: "8%", color: "bg-[#be4444]" }
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#58645d]">{item.label}</span>
                  <span className="font-semibold text-[#1f2933]">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#edf1ec]">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-md border border-[#d8ded8] bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">Workspace priorities</h2>
            <p className="mt-1 text-sm text-[#647067]">
              Built around financial operations, not a single billing workflow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {operatingFocus.map((item) => (
              <div key={item} className="flex min-h-16 items-start gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
                <span className="text-sm font-medium leading-5 text-[#1f2933]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
