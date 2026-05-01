import { cx } from "./utils";

const toneClasses = {
  green: "bg-[#e1f3ef] text-[#0f5f59]",
  blue: "bg-[#e7efff] text-[#2455a4]",
  amber: "bg-[#fff0cc] text-[#8a5a00]",
  rose: "bg-[#ffe7e7] text-[#a13d3d]",
  neutral: "bg-[#edf1ec] text-[#58645d]"
};

type StatusPillProps = {
  children: string;
  tone?: keyof typeof toneClasses;
  className?: string;
};

export function StatusPill({ children, tone = "neutral", className }: StatusPillProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
