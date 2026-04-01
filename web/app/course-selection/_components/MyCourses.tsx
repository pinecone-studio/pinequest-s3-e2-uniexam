"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { graphqlRequest } from "@/lib/graphql";
import { resolveStudentId } from "@/lib/students";
import { cn } from "@/lib/utils";
import { isHiddenStudentExam } from "@/lib/exam-visibility";
import { dispatchDashboardDataSync } from "@/app/dashboard/_components/dashboard-data-sync";

type Course = {
  id: string;
  name: string;
  code: string;
  exams: {
    id: string;
    title: string;
    start_time: string;
  }[];
};

type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
};

type MyCoursesResponse = {
  studentByEmail: {
    id: string;
  } | null;
  enrollments: Enrollment[];
  courses: Course[];
};

type CreateEnrollmentResponse = {
  createEnrollment: Enrollment;
};

type CourseSummary = {
  id: string;
  name: string;
  code: string;
  totalExamCount: number;
  upcomingExamCount: number;
  nextExamLabel: string;
  nextExamTitle: string | null;
  nextExamTimestamp: number | null;
};

interface MyCoursesProps {
  className?: string;
}

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
      }
    }
  }
`;

const CREATE_ENROLLMENT_MUTATION = `
  mutation CreateEnrollment($studentId: String!, $courseId: String!) {
    createEnrollment(student_id: $studentId, course_id: $courseId) {
      id
      student_id
      course_id
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

const getVisibleExams = (exams: Course["exams"]) =>
  (exams ?? []).filter((exam) => !isHiddenStudentExam(exam.title));

const getUpcomingExams = (exams: Course["exams"]) => {
  const now = Date.now();

  return getVisibleExams(exams)
    .filter((exam) => {
      const startsAt = new Date(exam.start_time).getTime();
      return Number.isFinite(startsAt) && startsAt >= now;
    })
    .sort(
      (left, right) =>
        new Date(left.start_time).getTime() - new Date(right.start_time).getTime(),
    );
};

const buildCourseSummary = (course: Course): CourseSummary => {
  const visibleExams = getVisibleExams(course.exams);
  const upcomingExams = getUpcomingExams(course.exams);
  const nextExam = upcomingExams[0] ?? null;

  return {
    id: course.id,
    name: course.name,
    code: course.code,
    totalExamCount: visibleExams.length,
    upcomingExamCount: upcomingExams.length,
    nextExamLabel: nextExam
      ? formatExamDateTime(nextExam.start_time)
      : "Ойрын тов алга",
    nextExamTitle: nextExam?.title ?? null,
    nextExamTimestamp: nextExam
      ? new Date(nextExam.start_time).getTime()
      : null,
  };
};

const buildEnrolledCourses = (
  courses: Course[],
  enrollments: Enrollment[],
  studentId: string | null,
) => {
  if (!studentId) {
    return [];
  }

  const enrolledCourseIds = new Set(
    enrollments
      .filter((enrollment) => enrollment.student_id === studentId)
      .map((enrollment) => enrollment.course_id),
  );

  return courses
    .filter((course) => enrolledCourseIds.has(course.id))
    .map((course) => buildCourseSummary(course))
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

const sortCourses = (courses: Course[]) =>
  [...courses].sort((left, right) => left.name.localeCompare(right.name));

const MyCourses = ({ className }: MyCoursesProps) => {
  const { user, isLoaded } = useUser();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [pendingCourseIds, setPendingCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentEmail = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!studentEmail) {
          if (!cancelled) {
            setAvailableCourses([]);
            setStudentEnrollments([]);
            setStudentId(null);
            setPendingCourseIds([]);
            setLoading(false);
          }
          return;
        }

        const data = await graphqlRequest<MyCoursesResponse>(MY_COURSES_QUERY, {
          email: studentEmail,
        });

        if (cancelled) {
          return;
        }

        setAvailableCourses(sortCourses(data.courses ?? []));
        setStudentId(data.studentByEmail?.id ?? null);
        setStudentEnrollments(data.enrollments ?? []);
        setPendingCourseIds([]);
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Хичээлийн мэдээлэл дуудахад алдаа гарлаа.",
          );
        }
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
  }, [isLoaded, studentEmail]);

  const enrolledCourses = useMemo(
    () => buildEnrolledCourses(availableCourses, studentEnrollments, studentId),
    [availableCourses, studentEnrollments, studentId],
  );

  const enrolledCourseIds = useMemo(
    () =>
      new Set(
        studentEnrollments
          .filter((enrollment) => enrollment.student_id === studentId)
          .map((enrollment) => enrollment.course_id),
      ),
    [studentEnrollments, studentId],
  );

  const allCourses = useMemo(
    () => availableCourses.map((course) => buildCourseSummary(course)),
    [availableCourses],
  );

  const totalUpcomingExamCount = useMemo(
    () =>
      enrolledCourses.reduce(
        (sum, course) => sum + course.upcomingExamCount,
        0,
      ),
    [enrolledCourses],
  );

  const handleToggleCourse = (courseId: string, checked: boolean) => {
    setPendingCourseIds((current) => {
      if (checked) {
        return current.includes(courseId) ? current : [...current, courseId];
      }

      return current.filter((item) => item !== courseId);
    });
  };

  const handleSaveCourses = async () => {
    const studentName =
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      studentEmail ||
      "Оюутан";

    if (!studentEmail) {
      toast.error("Хичээл сонгохын тулд эхлээд нэвтэрнэ үү.");
      return;
    }

    if (pendingCourseIds.length === 0) {
      toast.error("Хамгийн багадаа нэг хичээл сонгоно уу.");
      return;
    }

    try {
      setSaving(true);

      const resolvedStudentId =
        studentId || (await resolveStudentId(studentEmail, studentName));

      const responses = await Promise.all(
        pendingCourseIds.map((courseId) =>
          graphqlRequest<CreateEnrollmentResponse>(CREATE_ENROLLMENT_MUTATION, {
            studentId: resolvedStudentId,
            courseId,
          }),
        ),
      );

      setStudentId(resolvedStudentId);
      setStudentEnrollments((current) => [
        ...current,
        ...responses.map((item) => item.createEnrollment),
      ]);
      setPendingCourseIds([]);
      dispatchDashboardDataSync();
      toast.success("Сонгосон хичээлүүд хадгалагдлаа.");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Хичээл хадгалах үед алдаа гарлаа.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("grid gap-6 lg:grid-cols-[420px_1fr]", className)}>
        <div className="rounded-3xl border border-[#dce9e6] bg-white p-5">
          <Skeleton className="h-4 w-32 bg-slate-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={`course-checkbox-skeleton-${index + 1}`}
                className="h-20 w-full rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#dce9e6] bg-white p-5">
          <Skeleton className="h-4 w-36 bg-slate-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton
                key={`active-course-skeleton-${index + 1}`}
                className="h-20 w-full rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span className="rounded-full bg-[#eef7f4] px-3 py-1 text-[#006d77]">
          {enrolledCourses.length} идэвхтэй хичээл
        </span>
        <span className="rounded-full bg-[#eef7f4] px-3 py-1 text-[#006d77]">
          {totalUpcomingExamCount} ойрын шалгалт
        </span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {error}
        </div>
      ) : null}

      {!error && !studentEmail ? (
        <div className="rounded-3xl border border-[#dce9e6] bg-white px-5 py-6 text-sm text-slate-500">
          Нэвтэрсний дараа хичээлээ сонгож dashboard болон exams хуудсанд холбоно.
        </div>
      ) : null}

      {!error && studentEmail ? (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-[#dce9e6] bg-white p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006d77]">
                Хичээл сонголт
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Хичээлүүдээ check хийгээд хадгална
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Checked болсон идэвхтэй хичээлүүд dashboard болон exams хуудсанд ашиглагдана.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {allCourses.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Одоогоор сонгох боломжтой хичээл алга.
                </div>
              ) : (
                <div className="space-y-2">
                  {allCourses.map((course) => {
                    const isActive = enrolledCourseIds.has(course.id);
                    const isPending = pendingCourseIds.includes(course.id);
                    const checkboxId = `course-checkbox-${course.id}`;

                    return (
                      <Label
                        key={course.id}
                        htmlFor={checkboxId}
                        className={cn(
                          "items-start rounded-2xl border px-4 py-3",
                          isActive
                            ? "border-[#dce9e6] bg-[#f4faf7]"
                            : isPending
                              ? "border-[#b8d8d0] bg-[#f7fcfa]"
                              : "border-[#e7f1ee] bg-white",
                        )}
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={isActive || isPending}
                          disabled={isActive || saving}
                          onCheckedChange={(checked) =>
                            handleToggleCourse(course.id, checked === true)
                          }
                          className="mt-0.5 data-[checked]:border-[#006d77] data-[checked]:bg-[#006d77]"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006d77]">
                                {course.code}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {course.name}
                              </p>
                            </div>

                            {isActive ? (
                              <span className="shrink-0 rounded-full bg-[#006d77] px-2.5 py-1 text-[11px] text-white">
                                Идэвхтэй
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-slate-500">
                            <p>{course.totalExamCount} шалгалт</p>
                            <p>{course.upcomingExamCount} ойрын тов</p>
                            <p>{course.nextExamLabel}</p>
                          </div>
                        </div>
                      </Label>
                    );
                  })}
                </div>
              )}

              <Button
                type="button"
                onClick={handleSaveCourses}
                disabled={saving || pendingCourseIds.length === 0}
                className="h-11 w-full rounded-xl bg-[#006d77] text-white hover:bg-[#00565e]"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {pendingCourseIds.length > 0
                  ? `${pendingCourseIds.length} хичээл хадгалах`
                  : "Хичээл хадгалах"}
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-[#dce9e6] bg-white p-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#e7f1ee] pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006d77]">
                  Идэвхтэй жагсаалт
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  Сонгосон хичээлүүд
                </h2>
              </div>
              <span className="rounded-full bg-[#eef7f4] px-3 py-1 text-sm text-[#006d77]">
                {enrolledCourses.length}
              </span>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-slate-50 px-4 py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef7f4] text-[#006d77]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Одоогоор сонгосон хичээл алга
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Зүүн талаас check хийж хадгалахад энд орж ирнэ.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e7f1ee]">
                {enrolledCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className={cn(
                      "py-4",
                      index === 0 ? "pt-4" : "",
                      index === enrolledCourses.length - 1 ? "pb-0" : "",
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006d77]">
                          {course.code}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-slate-900">
                          {course.name}
                        </h3>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-sm font-semibold text-[#006d77]">
                          {course.upcomingExamCount} ойрын тов
                        </p>
                        <p className="text-sm text-slate-500">
                          {course.totalExamCount} шалгалт
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                      <div>
                        <p>{course.nextExamLabel}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {course.nextExamTitle ?? "Шинэ тов хараахан нэмэгдээгүй байна."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default MyCourses;
