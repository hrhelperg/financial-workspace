import type { ReactNode } from "react";
import { cx } from "./utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section className={cx("rounded-md border border-[#d8ded8] bg-white p-5", className)}>
      {children}
    </section>
  );
}

type PanelHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PanelHeader({ title, description, action }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-normal text-[#1f2933]">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-[#647067]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
