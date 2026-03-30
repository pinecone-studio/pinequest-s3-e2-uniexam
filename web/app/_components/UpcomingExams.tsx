"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { graphqlRequest } from "@/lib/graphql";

type CourseExamResponse = {
  courses: {
    id: string;
    name: string;
    code: string;
    exams: {
      id: string;
      title: string;
      start_time: string;
      end_time: string;
      duration: number;
      type: string;
    }[];
  }[];
};

type UpcomingExamCard = {
  id: string;
  subject: string;
  title: string;
  date: string;
  time: string;
};

const UPCOMING_EXAMS_QUERY = `
  query UpcomingExams {
    courses {
      id
      name
      code
      exams {
        id
        title
        start_time
        end_time
        duration
        type
      }
    }
  }
`;

const formatExamDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const formatExamTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

export default function UpcomingExams() {
  const [exams, setExams] = useState<UpcomingExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadExams = async () => {
      try {
        const data =
          await graphqlRequest<CourseExamResponse>(UPCOMING_EXAMS_QUERY);

        if (cancelled) return;

        const nextExams = data.courses
          .flatMap((course) =>
            (course.exams ?? []).map((exam) => ({
              id: exam.id,
              subject: course.name || course.code,
              title: exam.title,
              date: formatExamDate(exam.start_time),
              time: formatExamTime(exam.start_time),
              startsAt: exam.start_time,
            })),
          )
          .sort(
            (left, right) =>
              new Date(left.startsAt).getTime() -
              new Date(right.startsAt).getTime(),
          )
          .map((exam) => ({
            id: exam.id,
            subject: exam.subject,
            title: exam.title,
            date: exam.date,
            time: exam.time,
          }));

        setExams(nextExams);
      } catch (fetchError) {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Шалгалтын мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadExams();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Өгөх шалгалтууд
      </h2>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
          Шалгалтуудыг ачаалж байна...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && exams.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
          Одоогоор шалгалттай хичээл алга.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                <Link href={`/exam?examId=${exam.id}`}>
                  <Button className="hover:cursor-pointer flex items-center gap-2 bg-[#006d77]">
                    Шалгалт өгөх <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
