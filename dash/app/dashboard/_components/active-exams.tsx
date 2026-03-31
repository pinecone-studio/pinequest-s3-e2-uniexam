"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  }
`;

const ENROLLMENTS_QUERY = `#graphql
  query ActiveExamStudents {
    enrollments {
      id
      student_id
      course_id
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

type GqlEnrollment = {
  id: string;
  student_id: string;
  course_id: string;
};

type ProctorAlertsResponse = {
  alerts: Array<{
    id: string;
    studentId: number;
    studentName: string;
    className: string;
    type: string;
    severity: string;
    message: string;
    createdAt: string;
  }>;
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

function classNameMatchesCourse(className: string, exam: GqlExam) {
  const hay = className.toLowerCase();
  const course = exam.course;
  if (!course) return false;
  const code = course.code?.toLowerCase();
  const name = course.name?.toLowerCase();
  const title = exam.title?.toLowerCase();
  return Boolean(
    (code && hay.includes(code)) ||
    (name && hay.includes(name)) ||
    (title && hay.includes(title)),
  );
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
        const [examsData, enrollmentsData, alertsRes] = await Promise.all([
          graphqlRequest<{ exams: GqlExam[] | null }>(EXAMS_QUERY),
          graphqlRequest<{ enrollments: GqlEnrollment[] | null }>(
            ENROLLMENTS_QUERY,
          ),
          fetch("/api/proctor-alerts").then(
            (r) => r.json() as Promise<ProctorAlertsResponse>,
          ),
        ]);

        const exams = examsData.exams ?? [];
        const enrollments = enrollmentsData.enrollments ?? [];
        const alerts = alertsRes.alerts ?? [];

        const nowMs = Date.now();
        const active = exams.filter((e) => isActiveExam(e, nowMs));

        const studentsByCourseId = new Map<string, Set<string>>();
        for (const enr of enrollments) {
          if (!enr.course_id) continue;
          const set = studentsByCourseId.get(enr.course_id) ?? new Set();
          set.add(enr.student_id);
          studentsByCourseId.set(enr.course_id, set);
        }

        const dashboard = active.map((exam) => {
          const courseCode = exam.course?.code ?? exam.course_id ?? "";
          const timeRange =
            exam.start_time && exam.end_time
              ? `${formatWhen(exam.start_time)}`
              : "";

          const students =
            (exam.course_id && studentsByCourseId.get(exam.course_id)?.size) ??
            0;

          const violations = alerts.filter((a) =>
            classNameMatchesCourse(a.className ?? "", exam),
          ).length;

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
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
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
          <button className="text-[12px] text-[#31A8E0] font-semibold hover:underline">
            Бүгдийг харах →
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="text-[12px] text-[#8a9bb0] py-2">
            Ачааллаж байна...
          </div>
        ) : activeExams.length === 0 ? (
          <div className="text-[12px] text-[#8a9bb0] py-2">
            Одоогоор идэвхтэй шалгалт алга байна
          </div>
        ) : (
          activeExams.map((e, idx) => {
            const hasViolations = e.violations > 0;
            const Icon = hasViolations ? Monitor : Info;
            const iconBg = hasViolations
              ? "bg-[#31A8E0]/10"
              : "bg-[#27ae60]/10";
            const iconColor = hasViolations
              ? "text-[#31A8E0]"
              : "text-[#27ae60]";
            const violationsColor = hasViolations
              ? "text-red-500"
              : "text-[#27ae60]";
            const btnBg = hasViolations
              ? "bg-[#31A8E0] hover:bg-[#1fa8bb]"
              : "bg-[#27ae60] hover:bg-[#219a52]";

            return (
              <div
                key={e.id ?? idx}
                className="flex items-center gap-3 border border-[#e8eef4] rounded-xl px-4 py-3"
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
                <Link href="/monitoring">
                  <Button
                    size="sm"
                    className={`${btnBg} text-white text-[12px] font-semibold ml-2 whitespace-nowrap rounded-lg h-8 px-3 border-0`}
                  >
                    Хяналт руу орох →
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
