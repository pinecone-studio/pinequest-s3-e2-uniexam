import { Globe, Monitor, ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  meta: string;
  students: number;
  alerts: number;
  online?: boolean;
  href: string;
};

export function ActiveExamCard({
  title,
  meta,
  students,
  alerts,
  online = false,
  href,
}: Props) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_6px_18px_rgba(15,25,35,0.035)]">
      <div className="flex items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
              online
                ? "border-slate-200 bg-slate-50 text-[#0F1923]"
                : "border-[#00B89C]/35 bg-[#00B89C]/8 text-[#00B89C]"
            }`}>
            {online ? (
              <Globe className="h-7 w-7" />
            ) : (
              <Monitor className="h-7 w-7" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-bold text-[#0F1923]">
              {title}
            </h3>
            <p className="mt-1 truncate text-[14px] text-slate-400">{meta}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-8">
          <div className="text-center">
            <p className="text-[17px] font-bold leading-none text-[#0F1923]">
              {students}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-slate-400">
              Оюутан
            </p>
          </div>

          <div className="text-center">
            <p
              className={`text-[17px] font-bold leading-none ${
                alerts > 0 ? "text-[#F0A500]" : "text-slate-400"
              }`}>
              {alerts}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-slate-400">
              Зөрчил
            </p>
          </div>

          <Link
            href="/monitoring"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-[14px] font-semibold text-slate-300 transition hover:border-[#00B89C]/25 hover:bg-[#00B89C]/5 hover:text-[#00B89C]">
            Хяналт руу орох
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
