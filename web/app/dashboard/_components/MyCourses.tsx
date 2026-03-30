"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, CalendarDays, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { graphqlRequest } from "@/lib/graphql";

type Course = {
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
};

type MyCoursesResponse = {
  studentByEmail: {
    id: string;
  } | null;
  enrollments: {
    id: string;
    student_id: string;
    course_id: string;
  }[];
  courses: Course[];
};

type CourseCard = {
  id: string;
  name: string;
  code: string;
  totalExams: number;
  upcomingExamCount: number;
  nextExamTitle: string | null;
  nextExamDateLabel: string;
  statusLabel: string;
  statusDescription: string;
  nextExamTimestamp: number | null;
};

const MY_COURSES_QUERY = `
  query MyCourses($email: String!) {
    studentByEmail(email: $email) {
      id
    }
    enrollments {
      id
      student_id
      course_id
    }
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

const formatExamDateTime = (value: string) =>
  new Intl.DateTimeFormat("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const getNextExam = (exams: Course["exams"]) => {
  const now = Date.now();

  return [...(exams ?? [])]
    .filter((exam) => {
      const startsAt = new Date(exam.start_time).getTime();
      return Number.isFinite(startsAt) && startsAt >= now;
    })
    .sort(
      (left, right) =>
        new Date(left.start_time).getTime() - new Date(right.start_time).getTime(),
    )[0];
};

const buildCourseCards = (
  courses: Course[],
  enrollments: MyCoursesResponse["enrollments"],
  studentId: string,
) => {
  const enrolledCourseIds = new Set(
    enrollments
      .filter((enrollment) => enrollment.student_id === studentId)
      .map((enrollment) => enrollment.course_id),
  );

  return courses
    .filter((course) => enrolledCourseIds.has(course.id))
    .map((course) => {
      const nextExam = getNextExam(course.exams);
      const nextExamTimestamp = nextExam
        ? new Date(nextExam.start_time).getTime()
        : null;
      const upcomingExamCount = (course.exams ?? []).filter((exam) => {
        const startsAt = new Date(exam.start_time).getTime();
        return Number.isFinite(startsAt) && startsAt >= Date.now();
      }).length;

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        totalExams: course.exams?.length ?? 0,
        upcomingExamCount,
        nextExamTitle: nextExam?.title ?? null,
        nextExamDateLabel: nextExam
          ? formatExamDateTime(nextExam.start_time)
          : "Товлогдоогүй",
        statusLabel:
          upcomingExamCount > 0
            ? `${upcomingExamCount} шалгалт хүлээгдэж байна`
            : course.exams?.length
              ? "Шалгалтын шинэ хугацаа алга"
              : "Шалгалт нэмэгдээгүй",
        statusDescription:
          upcomingExamCount > 0
            ? "Ойрын шалгалтын товоо хянаарай."
            : course.exams?.length
              ? "Энэ хичээлд одоогоор шинэ тов хараахан нэмэгдээгүй байна."
              : "Энэ хичээлд шалгалтын мэдээлэл хараахан ороогүй байна.",
        nextExamTimestamp,
      };
    })
    .sort((left, right) => {
      if (left.nextExamTimestamp && right.nextExamTimestamp) {
        return left.nextExamTimestamp - right.nextExamTimestamp;
      }

      if (left.nextExamTimestamp) {
        return -1;
      }

      if (right.nextExamTimestamp) {
        return 1;
      }

      return left.name.localeCompare(right.name);
    });
};

const MyCourses = () => {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState(
    "Танд одоогоор бүртгэлтэй хичээл алга.",
  );
  const { user, isLoaded } = useUser();

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          if (cancelled) return;

          setCourses([]);
          setEmptyMessage("Хичээлүүдээ харахын тулд нэвтэрнэ үү.");
          setLoading(false);
          return;
        }

        const data = await graphqlRequest<MyCoursesResponse>(MY_COURSES_QUERY, {
          email: studentEmail,
        });

        if (cancelled) return;

        const studentId = data.studentByEmail?.id;

        if (!studentId) {
          setCourses([]);
          setEmptyMessage("Танд одоогоор бүртгэлтэй хичээл алга.");
          return;
        }

        setCourses(buildCourseCards(data.courses ?? [], data.enrollments, studentId));
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Хичээлийн мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCourses();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

  return (
    <section className="mt-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800">Миний хичээлүүд</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Таны бүртгэлтэй хичээлүүд болон ойрын шалгалтын мэдээлэл.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card
              key={`my-course-skeleton-${index + 1}`}
              className="overflow-hidden rounded-2xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16 bg-slate-200" />
                      <Skeleton className="h-5 w-40 bg-slate-200" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-20 rounded-full bg-slate-200" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-24 rounded-2xl bg-slate-200" />
                  <Skeleton className="h-24 rounded-2xl bg-slate-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : null}

      {!loading && !error && courses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden rounded-2xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f4f1] text-[#006d77]">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006d77]">
                        {course.code}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900">
                        {course.name}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-full bg-[#eef6f6] px-3 py-1 text-[11px] font-medium text-[#0b4f56]">
                    {course.totalExams} шалгалт
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Дараагийн шалгалт</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {course.nextExamDateLabel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {course.nextExamTitle ?? "Шинэ шалгалт нэмэгдэхээр энд харагдана."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>Төлөв</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {course.statusLabel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {course.statusDescription}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default MyCourses;
