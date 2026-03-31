"use client";

import { ActiveExams } from "./_components/active-exams";
import { Announcements } from "./_components/announcements";
import { LatestGrades } from "./_components/latest-grades";
import { TodaySchedule } from "./_components/today-schedule";
import { UpcomingExams } from "./_components/upcoming-exams";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* ── Left Column ── */}
      <div className="flex gap-5 w-full">
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <ActiveExams />
        </div>
        {/* ── Right Column ── */}
        <div className="flex flex-col gap-5 w-[280px] shrink-0">
          <UpcomingExams />
        </div>
      </div>
      <div className="flex gap-5 w-full">
        <LatestGrades />
        <TodaySchedule />
        <Announcements />
      </div>
    </div>
  );
}
