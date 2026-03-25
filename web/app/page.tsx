"use client"

import Courses from "./_components/Courses"
import RecentResults from "./_components/RecentResults"
import UpcomingExams from "./_components/UpcomingExams"

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 md:grid-cols-[28%_72%] gap-8">
      {/* <Courses /> */}
      <div className="space-y-8">
        <UpcomingExams />
        {/* <RecentResults /> */}
      </div>
    </div>
  )
}