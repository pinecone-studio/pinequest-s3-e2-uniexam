"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { graphqlRequest } from "@/lib/graphql";

const EXAMS_QUERY = `#graphql
  query ActiveExams {
    exams {
      id
      title
      course_id
      start_time
      end_time
      duration
      course {
        id
        name
        code
      }
    }
    submissions {
      id
      student_id
      exam_id
      status
    }
    cheatLogs {
      id
      exam_id
    }
  }
`;

type GqlCourse = {
  id: string;
  name: string | null;
  code: string | null;
};

type GqlExam = {
  id: string;
  title: string | null;
  course_id: string | null;
  start_time: string;
  end_time: string;
  duration: number | null;
  course: GqlCourse | null;
};

type GqlSubmission = {
  id: string;
  student_id: string;
  exam_id: string;
  status: "in_progress" | "submitted" | "reviewed" | null;
};

type GqlCheatLog = {
  id: string;
  exam_id: string | null;
};

type DashboardExam = {
  id: string;
  title: string;
  meta: string;
  students: number;
  violations: number;
};

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function isActiveExam(exam: GqlExam, nowMs: number) {
  const start = new Date(exam.start_time).getTime();
  const end = new Date(exam.end_time).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return nowMs >= start && nowMs <= end;
}

export function ActiveExams() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeExams, setActiveExams] = useState<DashboardExam[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const examsData = await graphqlRequest<{
          exams: GqlExam[] | null;
          submissions: GqlSubmission[] | null;
          cheatLogs: GqlCheatLog[] | null;
        }>(EXAMS_QUERY);

        const exams = examsData.exams ?? [];
        const submissions = examsData.submissions ?? [];
        const cheatLogs = examsData.cheatLogs ?? [];

        const nowMs = Date.now();
        const active = exams.filter((e) => isActiveExam(e, nowMs));

        const studentsByExamId = new Map<string, Set<string>>();
        for (const submission of submissions) {
          if (!submission.exam_id || !submission.student_id) continue;
          if (
            submission.status !== "in_progress" &&
            submission.status !== "submitted" &&
            submission.status !== "reviewed"
          ) {
            continue;
          }
          const set = studentsByExamId.get(submission.exam_id) ?? new Set();
          set.add(submission.student_id);
          studentsByExamId.set(submission.exam_id, set);
        }

        const violationsByExamId = new Map<string, number>();
        for (const log of cheatLogs) {
          if (!log.exam_id) continue;
          violationsByExamId.set(
            log.exam_id,
            (violationsByExamId.get(log.exam_id) ?? 0) + 1,
          );
        }

        const dashboard = active.map((exam) => {
          const courseCode = exam.course?.code ?? exam.course_id ?? "";
          const timeRange =
            exam.start_time && exam.end_time
              ? `${formatWhen(exam.start_time)}`
              : "";

          const students = studentsByExamId.get(exam.id)?.size ?? 0;
          const violations = violationsByExamId.get(exam.id) ?? 0;

          return {
            id: exam.id,
            title: exam.title ?? "Шалгалтын нэр олдсонгүй",
            meta: `${courseCode}${timeRange ? ` · ${timeRange}` : ""}`,
            students,
            violations,
          };
        });

        if (!cancelled) setActiveExams(dashboard as DashboardExam[]);
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : "Шалгалтын мэдээлэл ачаалж чадсангүй",
        );
        setActiveExams([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const headerSubtitle = useMemo(() => {
    if (isLoading) return "Ачааллаж байна...";
    if (error) return "Мэдээлэл ачаалж чадсангүй";
    return `${activeExams.length} шалгалт одоо явагдаж байна`;
  }, [activeExams.length, error, isLoading]);

  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4] h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Явагдаж буй шалгалтууд
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              {headerSubtitle}
            </p>
          </div>
          <Link href="/monitoring">
            <button className="text-[12px] text-[#31A8E0] font-semibold hover:text-[#317be0]">
              Бүгдийг харах
            </button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className=" flex flex-1 flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-[#e8eef4] p-4"
            >
              <Skeleton className="h-[38px] w-[38px] rounded-[9px]" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          ))
        ) : activeExams.length === 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#dce8f2] bg-[#f8fbff] px-4 py-3">
            <p className="text-[12px] text-[#8a9bb0]">
              Одоогоор идэвхтэй шалгалт алга байна
            </p>
            <Link href="/exams">
              <Button
                size="sm"
                className="bg-[#31A8E0] hover:bg-[#2398cc] text-white text-[12px] font-semibold rounded-lg h-8 px-3 border-0"
              >
                Шалгалт нэмэх
              </Button>
            </Link>
          </div>
        ) : (
          activeExams.map((e, idx) => {
            const hasViolations = e.violations > 0;
            const Icon = hasViolations ? Monitor : Info;
            const iconBg = hasViolations
              ? "bg-[#31A8E0]/10"
              : "bg-[#2398cc]/10";
            const iconColor = hasViolations
              ? "text-[#31A8E0]"
              : "text-[#2398cc]";
            const violationsColor = hasViolations
              ? "text-red-500"
              : "text-[#C27A17]";
            const btnBg = hasViolations
              ? "bg-[#31A8E0] hover:bg-[#1fa8bb]"
              : "bg-[#31A8E0] hover:bg-[#2398cc]";

            return (
              <div
                key={e.id ?? idx}
                className="flex items-center gap-3 border border-[#e8eef4] rounded-xl p-4"
              >
                <div
                  className={`w-[38px] h-[38px] rounded-[9px] ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#2c3e50] truncate">
                    {e.title}
                  </p>
                  <p className="text-[11px] text-[#8a9bb0] mt-0.5">{e.meta}</p>
                </div>

                <div className="flex gap-4 shrink-0 text-right">
                  <div>
                    <p className="text-[13px] font-bold text-[#2c3e50]">
                      {e.students}
                    </p>
                    <p className="text-[10px] text-[#8a9bb0]">Оюутан</p>
                  </div>
                  <div>
                    <p className={`text-[13px] font-bold ${violationsColor}`}>
                      {e.violations}
                    </p>
                    <p className="text-[10px] text-[#8a9bb0]">Зөрчил</p>
                  </div>
                </div>
                <Link href={`/monitoring/${e.id}`}>
                  <Button
                    size="sm"
                    className={`${btnBg} text-white text-[12px] font-semibold ml-2 whitespace-nowrap rounded-lg h-8 px-3 border-0`}
                  >
                    Хяналт руу орох
                  </Button>
                </Link>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
