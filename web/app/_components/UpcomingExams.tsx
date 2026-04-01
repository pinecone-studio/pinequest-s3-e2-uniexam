"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Camera,
  ChevronRight,
  Clock,
  Keyboard,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isHiddenStudentExam } from "@/lib/exam-visibility";
import { graphqlRequest } from "@/lib/graphql";

type CourseExamResponse = {
  courses: {
    id: string;
    name: string;
    code: string;
    exams: {
      id: string;
      title: string;
      start_time: string | null;
      end_time: string | null;
      duration: number | null;
      type: string;
    }[];
  }[];
};

type SignedInUpcomingExamsResponse = {
  studentByEmail: {
    id: string;
  } | null;
  submissions: {
    id: string;
    student_id: string;
    exam_id: string;
    status: "in_progress" | "submitted" | "reviewed" | null;
  }[];
  courses: CourseExamResponse["courses"];
};

type UpcomingExamCard = {
  id: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  duration: number | null;
  hasKnownStartTime: boolean;
  startsAt: string;
  endsAt: string;
};

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

const getExamEndsAt = (exam: UpcomingExamCard) => {
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

const isExamExpired = (exam: UpcomingExamCard, currentTime: number) => {
  const endsAt = getExamEndsAt(exam);

  if (!endsAt) {
    return false;
  }

  return endsAt.getTime() < currentTime;
};

const canStartExam = (exam: UpcomingExamCard, currentTime: number) => {
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
  exam: UpcomingExamCard,
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

const buildUpcomingExamCards = (courses: CourseExamResponse["courses"]) =>
  courses
    .flatMap((course) =>
      (course.exams ?? [])
        .filter((exam) => !isHiddenStudentExam(exam.title))
        .map((exam) => ({
          id: exam.id,
          subject: course.name || course.code,
          title: exam.title,
          date: formatExamDate(exam.start_time),
          time: formatExamTime(exam.start_time),
          duration: exam.duration,
          hasKnownStartTime: Boolean(parseExamDate(exam.start_time)),
          startsAt: exam.start_time ?? "",
          endsAt: exam.end_time ?? "",
        })),
    )
    .sort(
      (left, right) =>
        (parseExamDate(left.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (parseExamDate(right.startsAt)?.getTime() ?? Number.MAX_SAFE_INTEGER),
    );

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

          const nextExams = buildUpcomingExamCards(data.courses).map(
            (exam) => ({
              id: exam.id,
              subject: exam.subject,
              title: exam.title,
              date: exam.date,
              time: exam.time,
              duration: exam.duration,
              hasKnownStartTime: exam.hasKnownStartTime,
              startsAt: exam.startsAt,
              endsAt: exam.endsAt,
            }),
          );

          setExams(nextExams);
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

        const nextExams = buildUpcomingExamCards(data.courses)
          .filter((exam) => !completedExamIds.has(exam.id))
          .map((exam) => ({
            id: exam.id,
            subject: exam.subject,
            title: exam.title,
            date: exam.date,
            time: exam.time,
            duration: exam.duration,
            hasKnownStartTime: exam.hasKnownStartTime,
            startsAt: exam.startsAt,
            endsAt: exam.endsAt,
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
    router.push(`/exam?examId=${selectedExam.id}`);
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

        <Dialog
          open={isWarningOpen}
          onOpenChange={(open) => {
            setIsWarningOpen(open);

            if (!open) {
              setSelectedExam(null);
            }
          }}
        >
          <DialogContent className="p-0 sm:max-w-xl" showCloseButton={false}>
            <DialogHeader className=" gap-1 border-b border-slate-100 px-7 py-5">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <AlertTriangle className="h-5 w-5 text-[#d97706]" />
                Шалгалтын өмнөх сануулга
              </DialogTitle>
              <DialogDescription className="text-xs pl-7 text-slate-500">
                Шалгалтаа эхлүүлэхээс өмнө дараах мэдээлэлтэй танилцана уу.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 px-6 py-4">
              {selectedExam ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-medium text-[#006d77]">
                    {selectedExam.subject}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {selectedExam.title}
                  </h3>
                </div>
              ) : null}

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Tab, focus, гарах оролдлогууд хянагдана
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Шалгалтын үеэр tab солих, цонхны focus алдах, window blur,
                      цонхноос гарах, мөн шалгалтын хэсгээс гарах оролдлогууд
                      анхааруулгад бүртгэгдэнэ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Камерын хяналт ажиллаж байна
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Олон хүн илрэх, царай харагдахгүй болох, доош удаан харах,
                      эсвэл утас харагдах үед систем анхааруулга өгнө.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Keyboard className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Shortcut болон хуулах үйлдэл хориотой
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ctrl, Alt, Meta товчлол, F12, PrintScreen, баруун товч,
                      copy, paste, cut зэрэг үйлдлүүдийг систем хориглоно.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {/* Бэлэн болсон үедээ шалгалтаа эхлүүлнэ үү */}
                      Анхааруулга !!!
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Оюутанд өгсөн бүх анхааруулга багшийн хяналтын самбарт
                      бодит хугацаанд (Real-time) бүртгэгдэж очихыг анхаарна уу.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="-mx-0 -mb-0 rounded-b-none border-t-0 bg-transparent px-6 pb-5 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWarningOpen(false)}
              >
                Буцах
              </Button>
              <Button
                type="button"
                onClick={handleStartExam}
                className="bg-[#006d77]"
                disabled={
                  !selectedExam || !canStartExam(selectedExam, currentTime)
                }
              >
                Шалгалт өгөх
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
