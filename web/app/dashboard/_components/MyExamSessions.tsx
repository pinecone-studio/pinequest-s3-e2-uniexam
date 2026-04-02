"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Clock, Clock3 } from "lucide-react";
import { ExamStartWarningDialog } from "@/app/_components/ExamStartWarningDialog";
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
import { graphqlRequest } from "@/lib/graphql";
import { buildExamHref } from "@/lib/exam-navigation";
import {
  buildDashboardExamCards,
  buildStudentUpcomingExamCards,
  canStartExam,
  getExamDurationLabel,
  getExamStartAvailabilityMessage,
  type ExamCourse,
  type ExamSubmissionSummary,
  type UpcomingExamCard,
} from "@/lib/upcoming-exams";
import { cn } from "@/lib/utils";
import { DASHBOARD_DATA_SYNC_EVENT } from "./dashboard-data-sync";

type DashboardExamSessionsResponse = {
  studentByEmail: {
    id: string;
  } | null;
  submissions: (ExamSubmissionSummary & {
    id: string;
  })[];
  courses: ExamCourse[];
};

interface MyExamSessionsProps {
  className?: string;
}

const DASHBOARD_EXAM_SESSIONS_QUERY = `
  query DashboardExamSessions($email: String!) {
    studentByEmail(email: $email) {
      id
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

export function MyExamSessions({ className }: MyExamSessionsProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [exams, setExams] = useState<UpcomingExamCard[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedExam, setSelectedExam] = useState<UpcomingExamCard | null>(
    null,
  );
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const visibleExams = useMemo(
    () => buildDashboardExamCards(exams, currentTime),
    [currentTime, exams],
  );

  const handleOpenWarning = (exam: UpcomingExamCard) => {
    if (!canStartExam(exam, currentTime)) {
      return;
    }

    setSelectedExam(exam);
    setIsWarningOpen(true);
  };

  const handleStartExam = () => {
    if (!selectedExam || !canStartExam(selectedExam, currentTime)) {
      return;
    }

    setIsWarningOpen(false);
    router.push(buildExamHref(selectedExam.id, "/dashboard"));
  };

  useEffect(() => {
    setHasMounted(true);
    setCurrentTime(Date.now());

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleDashboardDataSync = () => {
      setRefreshKey((current) => current + 1);
    };

    window.addEventListener(DASHBOARD_DATA_SYNC_EVENT, handleDashboardDataSync);

    return () => {
      window.removeEventListener(
        DASHBOARD_DATA_SYNC_EVENT,
        handleDashboardDataSync,
      );
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
          setMessage("Шалгалтын мэдээллээ харахын тулд бүртгэлээ шалгана уу.");
          return;
        }

        const nextExams = buildStudentUpcomingExamCards(
          response.courses,
          response.submissions,
          studentId,
        );

        setExams(nextExams);
        setMessage(
          nextExams.length === 0
            ? "Одоогоор идэвхтэй эсвэл ойрын шалгалт алга."
            : null,
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
  }, [isLoaded, refreshKey, user?.primaryEmailAddress?.emailAddress]);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "min-h-[320px] overflow-hidden rounded-2xl border-white/40 bg-white/60 ring-1 ring-black/8",
          className,
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pb-3 pt-1">
          <div>
            <CardTitle className="items-start gap-3 ">
              <div className="flex gap-3 text-sm font-bold text-slate-800">
                <div className="rounded-lg bg-[#e6f4f1] p-3 text-[#006d77]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  Миний шалгалтууд
                  <div className="text-[13px] font-medium text-slate-400">
                    Яг одоо явагдаж байгаа болон дараагийн 3 шалгалт.
                  </div>
                </div>
              </div>
            </CardTitle>
            <CardDescription></CardDescription>
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

        <CardContent className="flex flex-1 flex-col px-5 pb-5">
          {!hasMounted || loading ? (
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
              Одоогоор идэвхтэй эсвэл ойрын шалгалт алга.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleExams.slice(0, 3).map((exam) => {
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

                        <h3 className="mt-0.5 text-[14px] font-semibold leading-tight">
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
                          onClick={() => handleOpenWarning(exam)}
                          className="flex h-7 shrink-0 items-center gap-0.5 self-start rounded-md bg-[#006d77] px-3 py-0 text-[12px] hover:cursor-pointer lg:self-center"
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

      <ExamStartWarningDialog
        open={isWarningOpen}
        exam={selectedExam}
        currentTime={currentTime}
        onOpenChange={(open) => {
          setIsWarningOpen(open);

          if (!open) {
            setSelectedExam(null);
          }
        }}
        onStart={handleStartExam}
      />
    </TooltipProvider>
  );
}
