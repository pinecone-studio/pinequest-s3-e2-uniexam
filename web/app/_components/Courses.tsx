"use client"

import { BookOpen } from "lucide-react"

const courses = [
  { id: 1, name: "Computer Science", code: "CS101" },
  { id: 2, name: "Mathematics", code: "MATH201" },
  { id: 3, name: "Physics", code: "PHY101" },
  { id: 4, name: "English Literature", code: "ENG102" },
  { id: 5, name: "Data Structures", code: "CS202" },
  { id: 6, name: "Algorithms", code: "CS301" },
]

export default function Courses() {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        My Courses
      </h2>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            {/* ICON */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>

            {/* TEXT */}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.name}
              </p>
              <p className="text-xs text-gray-500">
                {course.code}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}