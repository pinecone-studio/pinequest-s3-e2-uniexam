import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string;
  badge: string;
  icon: ReactNode;
  tone?: "primary" | "warning" | "neutral";
};

export function SummaryCard({
  title,
  value,
  badge,
  icon,
  tone = "primary",
}: Props) {
  const toneStyles =
    tone === "warning"
      ? {
          iconWrap: "bg-[#F0A500]/10 text-[#F0A500]",
          badge: "bg-[#F0A500]/10 text-[#F0A500]",
        }
      : tone === "neutral"
        ? {
            iconWrap: "bg-slate-100 text-[#0F1923]",
            badge: "bg-[#00B89C]/10 text-[#00B89C]",
          }
        : {
            iconWrap: "bg-[#00B89C]/10 text-[#00B89C]",
            badge: "bg-[#00B89C]/10 text-[#00B89C]",
          };

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,25,35,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneStyles.iconWrap}`}>
          {icon}
        </div>

        <span
          className={`inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-bold ${toneStyles.badge}`}>
          {badge}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <p className="text-[28px] font-bold leading-none tracking-tight text-[#0F1923]">
          {value}
        </p>
        <p className="pb-0.5 text-[16px] leading-5 text-slate-400">{title}</p>
      </div>
    </div>
  );
}
