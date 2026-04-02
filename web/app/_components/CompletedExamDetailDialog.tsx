"use client";

import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
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

type CompletedExamDetailDialogExam = {
  id: string;
  examId: string;
  subject?: string;
  title: string;
  submittedAt: string;
  answeredCount: number;
  totalQuestions: number;
  status: "submitted" | "reviewed";
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
  points: number;
  question: string;
  questionType: string;
  studentAnswer: string;
  feedback?: string;
  score?: number | null;
};

interface CompletedExamDetailDialogProps {
  open: boolean;
  exam: CompletedExamDetailDialogExam | null;
  onOpenChange: (open: boolean) => void;
}

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

const getStatusLabel = (status: CompletedExamDetailDialogExam["status"]) => {
  if (status === "reviewed") {
    return "Шалгасан";
  }

  return "Илгээсэн";
};

export function CompletedExamDetailDialog({
  open,
  exam,
  onOpenChange,
}: CompletedExamDetailDialogProps) {
  const [detailItems, setDetailItems] = useState<CompletedExamDetailItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const submissionId = exam?.id;
  const examId = exam?.examId;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    if (open) {
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    if (!open || !submissionId || !examId) {
      setDetailItems([]);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    const loadExamDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const data = await graphqlRequest<CompletedExamDetailResponse>(
          COMPLETED_EXAM_DETAIL_QUERY,
          {
            submissionId,
            examId,
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
  }, [examId, open, submissionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {exam?.title ?? "Өгсөн шалгалт"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Оюутны өгсөн шалгалтын илгээсэн хариултууд.
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar max-h-[calc(85vh-92px)] overflow-y-auto px-6 py-5">
          {exam ? (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Хичээл</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {exam.subject ?? "Тодорхойгүй"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Илгээсэн</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatSubmittedDateOnly(exam.submittedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Төлөв</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getStatusLabel(exam.status)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">
                    Хариулсан
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Нийт {exam.totalQuestions}-аас {exam.answeredCount}
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
  );
}
