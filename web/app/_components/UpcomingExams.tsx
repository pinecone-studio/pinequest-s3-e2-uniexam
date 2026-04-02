"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExamStartWarningDialog } from "@/app/_components/ExamStartWarningDialog";
import { graphqlRequest } from "@/lib/graphql";
import { buildExamHref } from "@/lib/exam-navigation";
import {
  buildStudentUpcomingExamCards,
  buildUpcomingExamCards,
  canStartExam,
  getExamDurationLabel,
  getExamStartAvailabilityMessage,
  isExamExpired,
  type ExamCourse,
  type ExamSubmissionSummary,
  type UpcomingExamCard,
} from "@/lib/upcoming-exams";

type CourseExamResponse = {
  courses: ExamCourse[];
};

type SignedInUpcomingExamsResponse = {
  studentByEmail: {
    id: string;
  } | null;
  submissions: (ExamSubmissionSummary & {
    id: string;
  })[];
  courses: CourseExamResponse["courses"];
};

const UPCOMING_EXAMS_QUERY = `
  query UpcomingExams($email: String!) {
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

const UPCOMING_EXAMS_COURSES_ONLY_QUERY = `
  query UpcomingExamsCoursesOnly {
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

export default function UpcomingExams() {
  const [exams, setExams] = useState<UpcomingExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [selectedExam, setSelectedExam] = useState<UpcomingExamCard | null>(
    null,
  );
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

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

    const loadExams = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          const data = await graphqlRequest<CourseExamResponse>(
            UPCOMING_EXAMS_COURSES_ONLY_QUERY,
          );

          if (cancelled) return;

          setExams(buildUpcomingExamCards(data.courses));
          return;
        }

        const data = await graphqlRequest<SignedInUpcomingExamsResponse>(
          UPCOMING_EXAMS_QUERY,
          {
            email: studentEmail,
          },
        );

        if (cancelled) return;

        const studentId = data.studentByEmail?.id;

        if (!studentId) {
          setExams([]);
          return;
        }

        setExams(
          buildStudentUpcomingExamCards(
            data.courses,
            data.submissions,
            studentId,
          ),
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

    void loadExams();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

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
    router.push(buildExamHref(selectedExam.id, "/exams"));
  };

  const visibleExams = exams.filter(
    (exam) => !isExamExpired(exam, currentTime),
  );

  return (
    <TooltipProvider>
      <div>
        <h2 className="font-bold pb-7 text-[16px] text-slate-800 whitespace-nowrap transition-colors">
          Өгөх шалгалтууд
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`upcoming-skeleton-${index + 1}`}
                className="h-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div className="flex h-full min-h-30 w-full flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-slate-200" />
                    <Skeleton className="h-5 w-4/5 bg-slate-200" />
                    <Skeleton className="h-5 w-3/5 bg-slate-200" />
                  </div>

                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-20 bg-slate-200" />
                      <Skeleton className="h-4 w-16 bg-slate-200" />
                    </div>

                    <Skeleton className="h-9 w-28 rounded-md bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && !error && visibleExams.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
            Одоогоор шалгалттай хичээл алга.
          </div>
        ) : null}

        {!loading && visibleExams.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {visibleExams.map((exam) => {
              const examCanStart = canStartExam(exam, currentTime);
              const examStartMessage = getExamStartAvailabilityMessage(
                exam,
                currentTime,
              );

              return (
                <div
                  key={exam.id}
                  className="h-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
                >
                  <div className="flex h-full min-h-30 w-full flex-col justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium text-[#006d77]">
                        {exam.subject}
                      </p>

                      <h3 className="text-[18px] font-semibold text-gray-900">
                        {exam.title}
                      </h3>

                      <p className="mt-1 text-[12px] text-slate-500">
                        {getExamDurationLabel(exam.duration)}
                      </p>
                    </div>

                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2 text-gray-500 text-[11px]">
                        {exam.hasKnownStartTime ? (
                          <>
                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{exam.date}</span>
                            </div>

                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{exam.time}</span>
                            </div>
                          </>
                        ) : (
                          <div className="whitespace-nowrap">
                            <span>Эхлэх хугацаа тодорхойгүй</span>
                          </div>
                        )}
                      </div>

                      {examCanStart ? (
                        <Button
                          type="button"
                          onClick={() => handleOpenWarning(exam)}
                          className="hover:cursor-pointer flex shrink-0 rounded-md items-center gap-0.5 bg-[#006d77] px-3 py-0 h-7 text-[12px]"
                        >
                          Шалгалт өгөх <ChevronRight className="w-1.5 h-1.5" />
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex shrink-0">
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
                </div>
              );
            })}
          </div>
        ) : null}

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
      </div>
    </TooltipProvider>
  );
}
