"use client";

import { ActiveExams } from "./_components/active-exams";
import { Announcements } from "./_components/announcements";
import { CourseProgress } from "./_components/course-progress";
import { LatestFiles } from "./_components/latest-files";
import { LatestGrades } from "./_components/latest-grades";
import { TodaySchedule } from "./_components/today-schedule";
import { UpcomingExams } from "./_components/upcoming-exams";
import { Whatsdue } from "./_components/whatsdue";

export default function DashboardPage() {
  return (
    <div className="flex gap-5 p-6">
      {/* ── Left Column ── */}
      <div className="flex flex-col gap-5 flex-1 min-w-0">
        <CourseProgress />
        <ActiveExams />
        <Whatsdue />
        <LatestFiles />
        <Announcements />
      </div>

      {/* ── Right Column ── */}
      <div className="flex flex-col gap-5 w-[280px] shrink-0">
        <TodaySchedule />
        <LatestGrades />
        <UpcomingExams />
      </div>
    </div>
  );
}
