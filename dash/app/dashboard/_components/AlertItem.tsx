type Props = {
  name: string;
  message: string;
  time: string;
  tone?: "low" | "medium" | "high";
};

export function AlertItem({ name, message, time, tone = "high" }: Props) {
  const toneClass =
    tone === "high"
      ? "text-red-500"
      : tone === "medium"
        ? "text-amber-500"
        : "text-[#2a9d8f]";

  return (
    <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{message}</p>
      <p className={`mt-2 text-xs font-medium ${toneClass}`}>{time}</p>
    </div>
  );
}
