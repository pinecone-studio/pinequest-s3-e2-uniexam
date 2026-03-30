"use client";

import Link from "next/link";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const exams = [
  {
    id: 1,
    subject: "Компьютерийн ухаан",
    title: "Явцын шалгалт",
    date: "2026.03.26",
    time: "10:00",
    hasInProgress: true,
  },
  {
    id: 2,
    subject: "Математик",
    title: "Алгебрын сорил",
    date: "2026.03.28",
    time: "14:00",
    hasInProgress: false,
  },
];

export default function UpcomingExams() {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Өгөх шалгалтууд
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="h-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3"
          >
            <div className="flex h-full min-h-30 w-full flex-col justify-between gap-4">
              <div>
                <p className="text-[12px] font-medium text-indigo-500">
                  {exam.subject}
                </p>

                <h3 className="text-xl font-semibold text-gray-900">
                  {exam.title}
                </h3>
              </div>

              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-gray-500 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{exam.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{exam.time}</span>
                  </div>
                </div>

                {exam.hasInProgress ? (
                  <Link href="/exam">
                    <Button className="hover:cursor-pointer flex items-center gap-2">
                      Шалгалт өгөх <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <div aria-hidden="true" className="invisible">
                    <Button className="flex items-center">
                      Шалгалт өгөх <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
