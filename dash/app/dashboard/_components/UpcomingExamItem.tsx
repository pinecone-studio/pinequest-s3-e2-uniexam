type Props = {
  dayShort: string;
  dayLabel: string;
  time: string;
  title: string;
  meta: string;
  dotColor?: "green" | "yellow" | "dark";
};

export function UpcomingExamItem({
  dayShort,
  dayLabel,
  time,
  title,
  meta,
  dotColor = "green",
}: Props) {
  const dotClass =
    dotColor === "yellow"
      ? "bg-[#F0A500]"
      : dotColor === "dark"
        ? "bg-[#0F1923]"
        : "bg-[#00B89C]";

  return (
    <div className="flex items-center gap-5 border-b border-slate-200 px-5 py-4 last:border-b-0">
      <div className="w-[68px] shrink-0 text-center">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#00B89C]">
          {dayShort}
        </p>
        {dayLabel ? (
          <p className="mt-1 text-[13px] text-slate-400">{dayLabel}</p>
        ) : null}
        {time ? (
          <p className="mt-1 text-[20px] font-medium leading-none text-slate-400">
            {time}
          </p>
        ) : null}
      </div>

      <div className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`} />

      <div className="min-w-0">
        <p className="truncate text-[17px] font-semibold text-[#0F1923]">
          {title}
        </p>
        <p className="mt-1 truncate text-[14px] text-slate-400">{meta}</p>
      </div>
    </div>
  );
}
