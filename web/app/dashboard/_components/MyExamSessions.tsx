"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Clock, Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  date: string;
  time: string;
  duration: number | null;
  hasKnownStartTime: boolean;
  startsAt: string;
  endsAt: string;
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

const formatExamDate = (value: string | null | undefined) => {
  const parsed = parseExamDate(value);

  if (!parsed) {
    return "0000-00-00";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
};

const formatExamTime = (value: string | null | undefined) => {
  const parsed = parseExamDate(value);

  if (!parsed) {
    return "00:00";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const getExamDurationLabel = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return "Үргэлжлэх хугацаа тодорхойгүй";
  }

  return `Нийт ${value} минут үргэлжилнэ`;
};

const getExamEndsAt = (exam: SessionExamCard) => {
  const explicitEnd = parseExamDate(exam.endsAt);

  if (explicitEnd) {
    return explicitEnd;
  }

  const startsAt = parseExamDate(exam.startsAt);

  if (!startsAt) {
    return null;
  }

  if (
    typeof exam.duration === "number" &&
    !Number.isNaN(exam.duration) &&
    exam.duration > 0
  ) {
    return new Date(startsAt.getTime() + exam.duration * 60 * 1000);
  }

  return null;
};

const isExamExpired = (exam: SessionExamCard, currentTime: number) => {
  const endsAt = getExamEndsAt(exam);

  if (!endsAt) {
    return false;
  }

  return endsAt.getTime() < currentTime;
};

const canStartExam = (exam: SessionExamCard, currentTime: number) => {
  const startsAt = parseExamDate(exam.startsAt);

  if (!startsAt) {
    return false;
  }

  if (isExamExpired(exam, currentTime)) {
    return false;
  }

  return startsAt.getTime() <= currentTime;
};

const getExamStartAvailabilityMessage = (
  exam: SessionExamCard,
  currentTime: number,
) => {
  const startsAt = parseExamDate(exam.startsAt);

  if (!startsAt) {
    return "Эхлэх хугацаа тодорхойгүй";
  }

  if (startsAt.getTime() > currentTime) {
    return "Шалгалт өгөх хугацаа болоогүй байна";
  }

  return null;
};

const buildDashboardUpcomingExams = (
  data: DashboardExamSessionsResponse,
  studentId: string,
) => {
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

  return data.courses
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
          date: formatExamDate(exam.start_time),
          time: formatExamTime(exam.start_time),
          duration: exam.duration,
          hasKnownStartTime: Boolean(parseExamDate(exam.start_time)),
          startsAt: exam.start_time,
          endsAt: exam.end_time ?? "",
        })),
    )
    .filter((exam) => !completedExamIds.has(exam.id))
    .sort(
      (left, right) =>
        (parseExamDate(left.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (parseExamDate(right.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER),
    );
};

export function MyExamSessions({ className }: MyExamSessionsProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [exams, setExams] = useState<SessionExamCard[]>([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleExams = useMemo(
    () => exams.filter((exam) => !isExamExpired(exam, currentTime)).slice(0, 3),
    [currentTime, exams],
  );

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

          setExams([]);
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
          setExams([]);
          setMessage("Таны оюутны мэдээлэл олдсонгүй.");
          return;
        }

        const nextExams = buildDashboardUpcomingExams(response, studentId);

        setExams(nextExams);
        setMessage(
          nextExams.length === 0 ? "Одоогоор шалгалттай хичээл алга." : null,
        );
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
    <TooltipProvider>
      <Card
        className={cn(
          "overflow-hidden rounded-2xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5",
          className,
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pb-3 pt-1">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <div className="rounded-lg bg-[#e6f4f1] p-1.5 text-[#006d77]">
                <Clock3 className="h-3.5 w-3.5" />
              </div>
              Миний шалгалтууд
            </CardTitle>
            <CardDescription className="pl-9 text-[12px] font-medium text-slate-400">
              Эхний 3 өгөх шалгалтыг list хэлбэрээр харуулж байна.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/exams")}
            className="shrink-0 px-2 py-0.5 text-[11px]"
          >
            Бүгдийг харах <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="px-5 pb-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`exam-session-skeleton-${index + 1}`}
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-24 bg-slate-200" />
                      <Skeleton className="h-5 w-56 bg-slate-200" />
                      <Skeleton className="h-4 w-40 bg-slate-200" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-20 bg-slate-200" />
                        <Skeleton className="h-4 w-16 bg-slate-200" />
                      </div>
                    </div>

                    <Skeleton className="h-7 w-28 rounded-md bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          ) : message ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
              {message}
            </div>
          ) : visibleExams.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
              Одоогоор шалгалттай хичээл алга.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleExams.map((exam) => {
                const examCanStart = canStartExam(exam, currentTime);
                const examStartMessage = getExamStartAvailabilityMessage(
                  exam,
                  currentTime,
                );

                return (
                  <div
                    key={exam.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-[11px] font-medium text-[#006d77]">
                            {exam.subject}
                          </p>
                          <span className="text-[11px] text-slate-300">•</span>
                          <p className="text-[11px] text-slate-500">
                            {getExamDurationLabel(exam.duration)}
                          </p>
                        </div>

                        <h3 className="mt-0.5 text-[16px] font-semibold text-gray-900">
                          {exam.title}
                        </h3>

                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-gray-500">
                          {exam.hasKnownStartTime ? (
                            <>
                              <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <Calendar className="h-2.5 w-2.5" />
                                <span>{exam.date}</span>
                              </div>

                              <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <Clock className="h-2.5 w-2.5" />
                                <span>{exam.time}</span>
                              </div>
                            </>
                          ) : (
                            <div className="whitespace-nowrap">
                              <span>Эхлэх хугацаа тодорхойгүй</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {examCanStart ? (
                        <Button
                          type="button"
                          onClick={() => router.push(`/exam?examId=${exam.id}`)}
                          className="flex h-6 shrink-0 items-center gap-0.5 self-start rounded-md bg-[#006d77] px-2 py-0 text-[12px] hover:cursor-pointer lg:self-center"
                        >
                          Шалгалт өгөх <ChevronRight className="h-1.5 w-1.5" />
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex shrink-0 self-start lg:self-center">
                              <Button
                                type="button"
                                disabled
                                className="flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-[#006d77] px-3 py-0 text-[12px] text-white/90 hover:cursor-not-allowed"
                              >
                                Шалгалт өгөх{" "}
                                <ChevronRight className="h-1.5 w-1.5" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6}>
                            {examStartMessage}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
