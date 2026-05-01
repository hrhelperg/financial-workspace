import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  green: "bg-[#e1f3ef] text-[#0f5f59]",
  blue: "bg-[#e7efff] text-[#2455a4]",
  amber: "bg-[#fff0cc] text-[#8a5a00]",
  rose: "bg-[#ffe7e7] text-[#a13d3d]"
};

type MetricCardProps = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
};

export function MetricCard({ title, value, note, icon: Icon, tone = "green" }: MetricCardProps) {
  return (
    <section className="rounded-md border border-[#d8ded8] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#647067]">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal text-[#1f2933]">{value}</p>
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-md", toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm text-[#647067]">{note}</p>
    </section>
  );
}
