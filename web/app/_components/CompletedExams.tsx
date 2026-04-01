"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileCheck2,
  MessageSquareText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { graphqlRequest } from "@/lib/graphql";
import { getQuestionTypeLabel } from "@/lib/question-type-label";
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

type CompletedExamDetailResponse = {
  submission: {
    id: string;
    submitted_at: string | null;
    status: "in_progress" | "submitted" | "reviewed" | null;
    answers: {
      id: string;
      question_id: string | null;
      answer_id: string | null;
      text_answer: string | null;
      score: number | null;
      feedback: string | null;
    }[];
  } | null;
  examQuestions: {
    id: string;
    question_id: string;
    order_index: number;
    points: number;
  }[];
  questions: {
    id: string;
    text: string;
    type: string | null;
  }[];
  answers: {
    id: string;
    question_id: string;
    text: string;
    order_index: number;
  }[];
};

type CompletedExamDetailItem = {
  id: string;
  orderIndex: number;
  points: number;
  question: string;
  questionType: string;
  studentAnswer: string;
  feedback?: string;
  score?: number | null;
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

const COMPLETED_EXAM_DETAIL_QUERY = `
  query CompletedExamDetail($submissionId: String!, $examId: String!) {
    submission(id: $submissionId) {
      id
      submitted_at
      status
      answers {
        id
        question_id
        answer_id
        text_answer
        score
        feedback
      }
    }
    examQuestions(exam_id: $examId) {
      id
      question_id
      order_index
      points
    }
    questions {
      id
      text
      type
    }
    answers {
      id
      question_id
      text
      order_index
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

const getStatusLabel = (status: CompletedExamCard["status"]) => {
  if (status === "reviewed") {
    return "Шалгасан";
  }

  return "Илгээсэн";
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
  const [detailItems, setDetailItems] = useState<CompletedExamDetailItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
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
    if (typeof window === "undefined") {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    if (isDialogOpen) {
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isDialogOpen]);

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

  useEffect(() => {
    let cancelled = false;

    if (!isDialogOpen || !selectedExam) {
      return;
    }

    const loadExamDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const data = await graphqlRequest<CompletedExamDetailResponse>(
          COMPLETED_EXAM_DETAIL_QUERY,
          {
            submissionId: selectedExam.id,
            examId: selectedExam.examId,
          },
        );

        if (cancelled) return;

        const submissionAnswers = data.submission?.answers ?? [];
        const answersByQuestionId = new Map<
          string,
          CompletedExamDetailResponse["answers"]
        >([]);

        for (const answer of data.answers) {
          const current = answersByQuestionId.get(answer.question_id) ?? [];
          current.push(answer);
          answersByQuestionId.set(answer.question_id, current);
        }

        const questionsById = new Map(
          data.questions.map((question) => [question.id, question]),
        );
        const submissionAnswerByQuestionId = new Map(
          submissionAnswers
            .filter((answer) => answer.question_id)
            .map((answer) => [answer.question_id as string, answer]),
        );

        const nextDetailItems = data.examQuestions
          .slice()
          .sort((left, right) => left.order_index - right.order_index)
          .map<CompletedExamDetailItem>((examQuestion) => {
            const question = questionsById.get(examQuestion.question_id);
            const submissionAnswer = submissionAnswerByQuestionId.get(
              examQuestion.question_id,
            );
            const possibleAnswers = (
              answersByQuestionId.get(examQuestion.question_id) ?? []
            ).sort((left, right) => left.order_index - right.order_index);
            const selectedAnswer = possibleAnswers.find(
              (answer) => answer.id === submissionAnswer?.answer_id,
            );

            return {
              id: examQuestion.id,
              orderIndex: examQuestion.order_index,
              points: examQuestion.points ?? 0,
              question: question?.text ?? "Асуултын мэдээлэл олдсонгүй.",
              questionType: getQuestionTypeLabel(question?.type),
              studentAnswer:
                submissionAnswer?.text_answer?.trim() ||
                selectedAnswer?.text ||
                "Хариулаагүй",
              feedback: submissionAnswer?.feedback ?? undefined,
              score: submissionAnswer?.score ?? null,
            };
          });

        setDetailItems(nextDetailItems);
      } catch (fetchError) {
        if (cancelled) return;

        setDetailError(
          fetchError instanceof Error
            ? fetchError.message
            : "Шалгалтын дэлгэрэнгүй мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    };

    void loadExamDetail();

    return () => {
      cancelled = true;
    };
  }, [isDialogOpen, selectedExam]);

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
                      setDetailItems([]);
                      setDetailError(null);
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
                          <span>{formatSubmittedDateOnly(exam.submittedAt)}</span>
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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);

          if (!open) {
            setSelectedExam(null);
            setDetailItems([]);
            setDetailError(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {selectedExam?.title ?? "Өгсөн шалгалт"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Оюутны өгсөн шалгалтын илгээсэн хариултууд.
            </DialogDescription>
          </DialogHeader>

          <div className="no-scrollbar max-h-[calc(85vh-92px)] overflow-y-auto px-6 py-5">
            {selectedExam ? (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Хичээл</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedExam.subject ?? "Тодорхойгүй"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">
                      Илгээсэн
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatSubmittedDateOnly(selectedExam.submittedAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Төлөв</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {getStatusLabel(selectedExam.status)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Явц</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedExam.answeredCount}/{selectedExam.totalQuestions}
                    </p>
                  </div>
                </div>

                {detailLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }, (_, index) => (
                      <div
                        key={`detail-skeleton-${index + 1}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-2.5 w-16 bg-slate-200" />
                            <Skeleton className="h-4 w-4/5 bg-slate-200" />
                            <Skeleton className="h-4 w-3/5 bg-slate-200" />
                          </div>
                          <Skeleton className="h-6 w-14 rounded-full bg-slate-200" />
                        </div>

                        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                          <Skeleton className="h-2.5 w-20 bg-slate-200" />
                          <Skeleton className="mt-2 h-4 w-full bg-slate-200" />
                          <Skeleton className="mt-2 h-4 w-1/2 bg-slate-200" />
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
                          <Skeleton className="h-6 w-16 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {detailError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                    {detailError}
                  </div>
                ) : null}

                {!detailLoading && !detailError ? (
                  <div className="space-y-3">
                    {detailItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium text-[#006d77]">
                              Асуулт {index + 1}
                            </p>
                            <h4 className="mt-1 text-sm font-semibold text-slate-900">
                              {item.question}
                            </h4>
                          </div>
                          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                            {item.points} оноо
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-medium text-slate-500">
                            Таны хариулт
                          </p>
                          <p className="mt-1 text-sm text-slate-800">
                            {item.studentAnswer}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {item.questionType}
                          </span>
                          {item.score !== null && item.score !== undefined ? (
                            <span className="rounded-full bg-[#e6f4f1] px-3 py-1 text-[#006d77]">
                              Авсан оноо: {item.score}
                            </span>
                          ) : null}
                        </div>

                        {item.feedback ? (
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#d4ece6] bg-[#f6fbfa] px-4 py-3 text-sm text-slate-700">
                            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                            <div>
                              <p className="font-medium text-[#006d77]">
                                Багшийн сэтгэгдэл
                              </p>
                              <p className="mt-1">{item.feedback}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CompletedExams;
