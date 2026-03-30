import { Clock3, TriangleAlert, Users, Bell, PanelTopOpen } from "lucide-react";
import { SummaryCard } from "./_components/SummaryCard";
import { ActiveExamCard } from "./_components/ActiveExamCard";
import { UpcomingExamItem } from "./_components/UpcomingExamItem";

export default function DashboardPage() {
  return (
    <div className="h-full bg-[#F3F5F7]">
      <div className="h-full px-7 py-6">
        <div className="mx-auto flex h-full max-w-[1100px] flex-col">
          {/* Header */}
          <div className="mb-5 flex shrink-0 items-start justify-between gap-6">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-[#0F1923]">
                Хяналтын самбар
              </h1>
              <p className="mt-1 text-[15px] text-slate-400">
                2025 оны хавар · Долоо хоног 12
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex h-10 items-center gap-3 rounded-full border border-[#F0A500]/35 bg-[#F0A500]/8 px-4 text-[13px] font-semibold text-[#F0A500]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F0A500]" />
                Шууд хяналт
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#F0A500]">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mb-5 grid shrink-0 grid-cols-3 gap-3">
            <SummaryCard
              title="Идэвхтэй шалгалт"
              value="03"
              badge="12"
              tone="primary"
              icon={<Clock3 className="h-5 w-5" />}
            />

            <SummaryCard
              title="Анхааруулга"
              value="12"
              badge="15"
              tone="warning"
              icon={<TriangleAlert className="h-5 w-5" />}
            />

            <SummaryCard
              title="Шалгалт өгч буй"
              value="48"
              badge="+3"
              tone="neutral"
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            {/* Active exams */}
            <section className="shrink-0">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-[18px] font-bold text-[#0F1923]">
                    Явагдаж буй шалгалтууд
                  </h2>
                  <span className="inline-flex h-7 items-center rounded-full bg-[#00B89C]/10 px-3 text-[12px] font-bold text-[#00B89C]">
                    2 шалгалт
                  </span>
                </div>

                <button className="text-[13px] font-medium text-slate-400 transition hover:text-[#0F1923]">
                  Бүгдийг харах
                </button>
              </div>

              <div className="space-y-3">
                <ActiveExamCard
                  title="Архитектурын үндэс II"
                  meta="APCH-201 · Б-402 · Онлайн"
                  students={42}
                  alerts={3}
                  href="/monitoring/arch-201"
                />

                <ActiveExamCard
                  title="Өгөгдлийн сангийн удирдлага"
                  meta="CS-305 · Онлайн · 119 оюутан"
                  students={119}
                  alerts={0}
                  online
                  href="/monitoring/cs-305"
                />
              </div>
            </section>

            {/* Upcoming exams */}
            <section className="min-h-0 flex-1">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-bold text-[#0F1923]">
                  Удахгүй болох шалгалтууд
                </h2>

                <button className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-400 transition hover:text-[#0F1923]">
                  <PanelTopOpen className="h-4 w-4" />
                  Хуваарь
                </button>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,25,35,0.035)]">
                <UpcomingExamItem
                  dayShort="МЯГ"
                  dayLabel=""
                  time="14:30"
                  title="Математик анализ IV"
                  meta="MATH-402 · 56 оюутан"
                  dotColor="yellow"
                />

                <UpcomingExamItem
                  dayShort="ЛХА"
                  dayLabel="Маргааш"
                  time=""
                  title="Харагдлын физик"
                  meta="PHYS-301 · 38 оюутан"
                  dotColor="green"
                />

                <UpcomingExamItem
                  dayShort="БАА"
                  dayLabel=""
                  time="10:00"
                  title="Алгоритм дизайн"
                  meta="CS-211 · 72 оюутан"
                  dotColor="dark"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
