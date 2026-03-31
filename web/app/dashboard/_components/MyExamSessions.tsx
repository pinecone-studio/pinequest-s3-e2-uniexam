"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isHiddenStudentExam } from "@/lib/exam-visibility";
import { graphqlRequest } from "@/lib/graphql";
import { cn } from "@/lib/utils";

type DashboardExamSessionsResponse = {
  studentByEmail: {
    id: string;
  } | null;
  enrollments: {
    id: string;
    student_id: string;
    course_id: string;
  }[];
  submissions: {
    id: string;
    student_id: string;
    exam_id: string;
    status: "in_progress" | "submitted" | "reviewed" | null;
  }[];
  courses: {
    id: string;
    name: string;
    code: string;
    exams: {
      id: string;
      title: string;
      start_time: string;
      end_time: string | null;
      duration: number | null;
      type: string;
    }[];
  }[];
};

type SessionExamCard = {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  isInProgress: boolean;
};

type ExamBuckets = {
  current: SessionExamCard[];
  today: SessionExamCard[];
};

interface MyExamSessionsProps {
  className?: string;
}

const DASHBOARD_EXAM_SESSIONS_QUERY = `
  query DashboardExamSessions($email: String!) {
    studentByEmail(email: $email) {
      id
    }
    enrollments {
      id
      student_id
      course_id
    }
    submissions {
      id
      student_id
      exam_id
      status
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

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const parseExamDate = (value: string | null | undefined) => {
  if (!value || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const getExamEndsAt = (
  startTime: string,
  endTime: string | null,
  duration: number | null,
) => {
  const explicitEnd = parseExamDate(endTime);

  if (explicitEnd) {
    return explicitEnd;
  }

  const startsAt = parseExamDate(startTime);

  if (!startsAt) {
    return null;
  }

  if (
    typeof duration === "number" &&
    !Number.isNaN(duration) &&
    duration > 0
  ) {
    return new Date(startsAt.getTime() + duration * 60 * 1000);
  }

  return null;
};

const formatTimeRange = (
  startTime: string,
  endTime: string | null,
  duration: number | null,
) => {
  const start = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(startTime));
  const resolvedEnd = getExamEndsAt(startTime, endTime, duration);

  if (!resolvedEnd) {
    return `${start} - Тодорхойгүй`;
  }

  const end = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(resolvedEnd);

  return `${start} - ${end}`;
};

const startOfToday = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildExamBuckets = (
  data: DashboardExamSessionsResponse,
  studentId: string,
  currentDate: Date,
): ExamBuckets => {
  const now = currentDate;
  const todayStart = startOfToday(now).getTime();
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

  const enrolledCourseIds = new Set(
    data.enrollments
      .filter((enrollment) => enrollment.student_id === studentId)
      .map((enrollment) => enrollment.course_id),
  );
  const hasStudentEnrollments = enrolledCourseIds.size > 0;

  const completedExamIds = new Set(
    data.submissions
      .filter(
        (submission) =>
          submission.student_id === studentId &&
          (submission.status === "submitted" ||
            submission.status === "reviewed"),
      )
      .map((submission) => submission.exam_id),
  );

  const inProgressExamIds = new Set(
    data.submissions
      .filter(
        (submission) =>
          submission.student_id === studentId &&
          submission.status === "in_progress",
      )
      .map((submission) => submission.exam_id),
  );

  const exams = data.courses
    .filter((course) =>
      hasStudentEnrollments ? enrolledCourseIds.has(course.id) : true,
    )
    .flatMap((course) =>
      (course.exams ?? [])
        .filter((exam) => !isHiddenStudentExam(exam.title))
        .map((exam) => ({
          id: exam.id,
          title: exam.title,
          subject: course.name || course.code,
          startTime: exam.start_time,
          endTime: exam.end_time,
          duration: exam.duration,
          isInProgress: inProgressExamIds.has(exam.id),
        })),
    )
    .filter((exam) => {
      const startsAt = parseExamDate(exam.startTime);

      return startsAt && !completedExamIds.has(exam.id);
    });

  const current = exams
    .filter((exam) => {
      const startsAt = parseExamDate(exam.startTime);
      const endsAt = getExamEndsAt(exam.startTime, exam.endTime, exam.duration);
      const nowTime = now.getTime();

      if (!startsAt) {
        return false;
      }

      if (!endsAt) {
        return startsAt.getTime() <= nowTime;
      }

      return startsAt.getTime() <= nowTime && nowTime <= endsAt.getTime();
    })
    .sort(
      (left, right) =>
        (getExamEndsAt(left.startTime, left.endTime, left.duration)?.getTime() ??
          Number.MAX_SAFE_INTEGER) -
        (getExamEndsAt(right.startTime, right.endTime, right.duration)?.getTime() ??
          Number.MAX_SAFE_INTEGER),
    );

  const today = exams
    .filter((exam) => {
      const startsAt = parseExamDate(exam.startTime);
      const endsAt = getExamEndsAt(exam.startTime, exam.endTime, exam.duration);
      const nowTime = now.getTime();

      if (!startsAt) {
        return false;
      }

      const startTime = startsAt.getTime();
      const endTime = endsAt?.getTime();
      const isCurrent =
        startTime <= nowTime && (endTime === undefined || nowTime <= endTime);

      return (
        !isCurrent &&
        startTime >= todayStart &&
        startTime < tomorrowStart &&
        (endTime === undefined || endTime >= nowTime)
      );
    })
    .sort(
      (left, right) =>
        new Date(left.startTime).getTime() -
        new Date(right.startTime).getTime(),
    );

  return { current, today };
};

const SectionList = ({
  icon,
  title,
  description,
  emptyMessage,
  exams,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  emptyMessage: string;
  exams: SessionExamCard[];
}) => {
  const visibleExams = exams.slice(0, 4);
  const hiddenCount = Math.max(0, exams.length - visibleExams.length);

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#e6f4f1] p-2 text-[#006d77]">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {visibleExams.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleExams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#006d77]">
                    {exam.subject}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                    {exam.title}
                  </p>
                </div>

                {exam.isInProgress ? (
                  <span className="shrink-0 rounded-full bg-[#e6f4f1] px-3 py-1 text-[11px] font-medium text-[#006d77]">
                    Үргэлжилж байна
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateTime(exam.startTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatTimeRange(exam.startTime, exam.endTime, exam.duration)}
                </span>
              </div>
            </div>
          ))}

          {hiddenCount > 0 ? (
            <p className="px-1 text-xs font-medium text-slate-400">
              +{hiddenCount} нэмэлт шалгалт байна
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export function MyExamSessions({ className }: MyExamSessionsProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [examSessionsData, setExamSessionsData] =
    useState<DashboardExamSessionsResponse | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const buckets = useMemo(() => {
    if (!examSessionsData || !studentId) {
      return {
        current: [],
        today: [],
      };
    }

    return buildExamBuckets(examSessionsData, studentId, new Date(currentTime));
  }, [currentTime, examSessionsData, studentId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadExamSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          if (cancelled) return;

          setExamSessionsData(null);
          setStudentId(null);
          setMessage("Шалгалтуудаа харахын тулд нэвтэрнэ үү.");
          setLoading(false);
          return;
        }

        const response = await graphqlRequest<DashboardExamSessionsResponse>(
          DASHBOARD_EXAM_SESSIONS_QUERY,
          { email: studentEmail },
        );

        if (cancelled) return;

        const studentId = response.studentByEmail?.id;

        if (!studentId) {
          setExamSessionsData(null);
          setStudentId(null);
          setMessage("Таны оюутны мэдээлэл олдсонгүй.");
          return;
        }

        setExamSessionsData(response);
        setStudentId(studentId);
        setMessage(null);
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

    void loadExamSessions();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pb-3 pt-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <div className="rounded-lg bg-[#e6f4f1] p-1.5 text-[#006d77]">
              <Clock3 className="h-3.5 w-3.5" />
            </div>
            Миний шалгалтууд
          </CardTitle>
          <CardDescription className="pl-9 text-[12px] font-medium text-slate-400">
            Яг одоо явагдаж буй болон өнөөдөр товлогдсон шалгалтууд.
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/exams")}
          className="shrink-0"
        >
          Бүгдийг харах <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={`exam-session-skeleton-${index + 1}`}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-slate-200" />
                    <Skeleton className="h-3 w-44 bg-slate-200" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Skeleton className="h-24 rounded-2xl bg-slate-200" />
                  <Skeleton className="h-24 rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        ) : message ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
            {message}
          </div>
        ) : buckets.current.length === 0 && buckets.today.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
            Танд яг одоо эсвэл өнөөдөр товлогдсон шалгалт алга.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <SectionList
              icon={<Clock3 className="h-4 w-4" />}
              title="Яг одоо явагдаж буй"
              description="Энэ мөчид хугацаа нь үргэлжилж буй шалгалтууд."
              emptyMessage="Яг одоо явагдаж буй шалгалт алга."
              exams={buckets.current}
            />
            <SectionList
              icon={<CalendarDays className="h-4 w-4" />}
              title="Өнөөдөр болох"
              description="Өнөөдөр эхлэхээр товлогдсон таны шалгалтууд."
              emptyMessage="Өнөөдөр өөр шалгалт товлогдоогүй байна."
              exams={buckets.today}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
