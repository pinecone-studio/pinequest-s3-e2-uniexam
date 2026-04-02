"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileCheck2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CompletedExamDetailDialog } from "@/app/_components/CompletedExamDetailDialog";
import { graphqlRequest } from "@/lib/graphql";
import { cn } from "@/lib/utils";

type CompletedExamCard = {
  id: string;
  examId: string;
  subject?: string;
  title: string;
  submittedAt: string;
  answeredCount: number;
  totalQuestions: number;
  status: "submitted" | "reviewed";
};

type CompletedExamsResponse = {
  studentByEmail: {
    id: string;
  } | null;
  submissions: {
    id: string;
    student_id: string;
    exam_id: string;
    submitted_at: string | null;
    status: "in_progress" | "submitted" | "reviewed" | null;
    answers: {
      id: string;
    }[];
  }[];
  exams: {
    id: string;
    title: string;
    course: {
      name: string;
      code: string;
    } | null;
  }[];
};

type ExamQuestionsCountResponse = {
  examQuestions: {
    id: string;
  }[];
};

const SUBMITTED_EXAMS_HASH = "#submitted-exams";

const COMPLETED_EXAMS_QUERY = `
  query CompletedExams($email: String!) {
    studentByEmail(email: $email) {
      id
    }
    submissions {
      id
      student_id
      exam_id
      submitted_at
      status
      answers {
        id
      }
    }
    exams {
      id
      title
      course {
        name
        code
      }
    }
  }
`;

const EXAM_QUESTIONS_COUNT_QUERY = `
  query ExamQuestionsCount($examId: String!) {
    examQuestions(exam_id: $examId) {
      id
    }
  }
`;

const formatSubmittedDateOnly = (value: string) => {
  const submittedAt = new Date(value);

  if (Number.isNaN(submittedAt.getTime())) {
    return "Огноо тодорхойгүй";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(submittedAt);
};

const CompletedExams = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [completedExams, setCompletedExams] = useState<CompletedExamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<CompletedExamCard | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash !== SUBMITTED_EXAMS_HASH) {
      return;
    }

    setIsOpen(true);

    requestAnimationFrame(() => {
      document
        .getElementById("submitted-exams")
        ?.scrollIntoView({ block: "start" });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const studentEmail = user?.primaryEmailAddress?.emailAddress;

    if (!studentEmail) {
      setCompletedExams([]);
      setLoading(false);
      return;
    }

    const loadCompletedExams = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await graphqlRequest<CompletedExamsResponse>(
          COMPLETED_EXAMS_QUERY,
          { email: studentEmail },
        );

        if (cancelled) return;

        const studentId = data.studentByEmail?.id;

        if (!studentId) {
          setCompletedExams([]);
          return;
        }

        const submittedExamIds = Array.from(
          new Set(
            data.submissions
              .filter(
                (submission) =>
                  submission.student_id === studentId &&
                  (submission.status === "submitted" ||
                    submission.status === "reviewed"),
              )
              .map((submission) => submission.exam_id),
          ),
        );

        const examQuestionCounts = await Promise.all(
          submittedExamIds.map(async (examId) => {
            const examQuestionsData =
              await graphqlRequest<ExamQuestionsCountResponse>(
                EXAM_QUESTIONS_COUNT_QUERY,
                { examId },
              );

            return [
              examId,
              examQuestionsData.examQuestions?.length ?? 0,
            ] as const;
          }),
        );

        if (cancelled) return;

        const examQuestionCountByExamId = new Map(examQuestionCounts);

        const examsById = new Map(
          data.exams.map((exam) => [
            exam.id,
            {
              title: exam.title,
              subject: exam.course?.name ?? exam.course?.code ?? undefined,
              totalQuestions: examQuestionCountByExamId.get(exam.id) ?? 0,
            },
          ]),
        );

        const nextCompletedExams = data.submissions
          .filter(
            (submission) =>
              submission.student_id === studentId &&
              (submission.status === "submitted" ||
                submission.status === "reviewed"),
          )
          .map<CompletedExamCard | null>((submission) => {
            const exam = examsById.get(submission.exam_id);

            if (!exam) {
              return null;
            }

            return {
              id: submission.id,
              examId: submission.exam_id,
              subject: exam.subject,
              title: exam.title,
              submittedAt: submission.submitted_at ?? "",
              answeredCount: submission.answers?.length ?? 0,
              totalQuestions: exam.totalQuestions,
              status:
                submission.status === "reviewed" ? "reviewed" : "submitted",
            };
          })
          .filter((exam): exam is CompletedExamCard => exam !== null)
          .sort(
            (left, right) =>
              new Date(right.submittedAt).getTime() -
              new Date(left.submittedAt).getTime(),
          );

        setCompletedExams(nextCompletedExams);
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Өгсөн шалгалтын мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCompletedExams();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

  return (
    <section id="submitted-exams" className="mt-14 w-full scroll-mt-24">
      <button
        type="button"
        onClick={() => setIsOpen((prev: boolean) => !prev)}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-4 py-4 text-left transition-all hover:cursor-pointer"
      >
        <h2 className="whitespace-nowrap text-[16px] font-bold text-slate-800 transition-colors">
          Өгсөн шалгалтууд
        </h2>

        <div className="relative h-[1.5px] flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`absolute inset-0 origin-left transition-transform duration-500 ${
              isOpen ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </div>

        <div
          className={cn(
            "rounded-full p-1.5 transition-all duration-200",
            isOpen
              ? "bg-slate-50 text-slate-400"
              : "bg-slate-50 text-slate-400 group-hover:bg-slate-100",
          )}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen
            ? "mt-6 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pt-1">
            {loading ? (
              <>
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={`completed-exam-skeleton-${index + 1}`}
                    className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

                      <div className="min-w-0 space-y-2">
                        <Skeleton className="h-3 w-20 bg-slate-200" />
                        <Skeleton className="h-4 w-44 bg-slate-200" />
                        <div className="flex items-center gap-3 pt-1">
                          <Skeleton className="h-3 w-3 rounded-full bg-slate-200" />
                          <Skeleton className="h-3 w-28 bg-slate-200" />
                        </div>
                      </div>
                    </div>

                    <Skeleton className="h-9 w-28 rounded-full bg-slate-200 md:self-center" />
                  </div>
                ))}
              </>
            ) : null}

            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {!loading && !error && completedExams.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
                Одоогоор өгсөн шалгалт алга.
              </div>
            ) : null}

            {!loading && !error
              ? completedExams.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setSelectedExam(exam);
                      setIsDialogOpen(true);
                    }}
                    className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-left transition-colors hover:cursor-pointer hover:border-[#bfe3dd] hover:bg-[#f7fbfa] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f1] text-[#006d77]">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        {exam.subject ? (
                          <p className="text-[11px] font-medium text-[#006d77]">
                            {exam.subject}
                          </p>
                        ) : null}

                        <h3 className="text-[13px] font-semibold text-gray-800 md:text-[16px]">
                          {exam.title}
                        </h3>

                        <div className="pt-1 text-xs text-gray-500 flex items-center gap-3">
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            {formatSubmittedDateOnly(exam.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex self-start items-center gap-2 rounded-full bg-[#e6f4f1] px-4 py-2 text-xs font-medium text-[#006d77] md:self-center">
                      <FileCheck2 className="h-4 w-4" />
                      <span>
                        {exam.answeredCount}/{exam.totalQuestions} асуулт
                      </span>
                    </div>
                  </button>
                ))
              : null}
          </div>
        </div>
      </div>

      <CompletedExamDetailDialog
        open={isDialogOpen}
        exam={selectedExam}
        onOpenChange={(open) => {
          setIsDialogOpen(open);

          if (!open) {
            setSelectedExam(null);
          }
        }}
      />
    </section>
  );
};

export default CompletedExams;
