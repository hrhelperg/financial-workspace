import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#1f2933]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647067]">{description}</p>
      </div>
      {actionLabel ? (
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
        >
          {ActionIcon ? <ActionIcon className="h-4 w-4" aria-hidden="true" /> : null}
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
