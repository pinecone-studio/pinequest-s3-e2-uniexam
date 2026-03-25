"use client"

import Link from "next/link"
import { Calendar, Clock, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"


const exams = [
  {
    id: 1,
    subject: "Computer Science",
    title: "Midterm Exam",
    date: "2026-03-26",
    time: "10:00",
    hasInProgress: true,
  },
  {
    id: 2,
    subject: "Mathematics",
    title: "Algebra Quiz",
    date: "2026-03-28",
    time: "14:00",
    hasInProgress: false,
  },
]

export default function UpcomingExams() {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Upcoming Exams
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex justify-between items-center rounded-2xl border border-gray-200 bg-gray-50 px-6 py-5 shadow-sm"
          >
            {/* LEFT */}
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">
                {exam.subject}
              </p>

              <h3 className="text-xl font-semibold text-gray-900">
                {exam.title}
              </h3>

              <div className="flex items-center gap-6 mt-4 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{exam.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{exam.time}</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            {exam.hasInProgress && (
              <Link href={"./exam"}>
        <Button className="hover:cursor-pointer">
          Continue to Exam <ChevronRight />
        </Button>
      </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}