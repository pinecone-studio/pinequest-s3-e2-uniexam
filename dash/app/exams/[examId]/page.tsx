"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { graphqlRequest } from "@/lib/graphql";
import {
  ArrowLeft,
  Check,
  Clock,
  Calendar,
  BookOpen,
  Loader2,
  Pencil,
  Trash2,
  FileQuestion,
  AlignLeft,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { AddQuestionManually } from "./_components/AddQuestionManually";
import { QuestionCreator } from "./_components/QuestionCreator";
import { EditOpenEndedDialog } from "./_components/EditOpenEndedDialog";
import type {
  ExamDifficulty,
  ExamQuestionDraft,
} from "../_components/exam-draft-types";

const EXAM_QUERY = `#graphql
  query ExamDetail($id: String!) {
    exam(id: $id) {
      id
      title
      description
      start_time
      end_time
      duration
      course {
        name
        code
      }
      questions {
        id
        text
        image_url
        order_index
        difficulty
        question_type
        max_points
        answers {
          id
          text
          is_correct
        }
      }
    }
  }
`;

const DELETE_QUESTION = `#graphql
  mutation DeleteQuestion($id: String!) {
    deleteQuestion(id: $id)
  }
`;

const DELETE_EXAM = `#graphql
  mutation DeleteExam($id: String!) {
    deleteExam(id: $id)
  }
`;

type AnswerRow = {
  id: string;
  text: string;
  is_correct: boolean;
};

type QuestionRow = {
  id: string;
  text: string;
  image_url?: string | null;
  order_index: number | null;
  difficulty: string | null;
  question_type?: string | null;
  max_points?: number | null;
  answers: AnswerRow[] | null;
};

type ExamDetail = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration: number;
  course: { name: string; code: string } | null;
  questions: QuestionRow[] | null;
};

function answersToDraft(q: QuestionRow): ExamQuestionDraft {
  const sorted = [...(q.answers ?? [])].sort((a, b) =>
    a.id && b.id ? a.id.localeCompare(b.id) : 0,
  );
  const options = ["", "", "", "", ""] as ExamQuestionDraft["options"];
  sorted.slice(0, 5).forEach((a, i) => {
    options[i] = a.text;
  });
  const correct = sorted.findIndex((a) => a.is_correct);
  const d = (q.difficulty ?? "medium") as ExamDifficulty;
  return {
    id: q.id,
    content: q.text ?? "",
    image_url: q.image_url ?? null,
    difficulty: ["easy", "medium", "hard"].includes(d) ? d : "medium",
    options,
    correctOptionIndex: correct >= 0 ? correct : 0,
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const diffConfig: Record<string, { label: string; cls: string }> = {
  easy: { label: "Хялбар", cls: "bg-emerald-50 text-emerald-700" },
  medium: { label: "Дунд", cls: "bg-amber-50 text-amber-700" },
  hard: { label: "Хүнд", cls: "bg-red-50 text-red-700" },
};

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = typeof params.examId === "string" ? params.examId : "";

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  // Multiple choice edit
  const [editDraft, setEditDraft] = useState<ExamQuestionDraft | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  // Open-ended edit
  const [editOpenQuestion, setEditOpenQuestion] = useState<QuestionRow | null>(
    null,
  );
  // Deleting
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingExam, setDeletingExam] = useState(false);

  const load = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const data = await graphqlRequest<{ exam: ExamDetail | null }>(
        EXAM_QUERY,
        { id: examId },
      );
      setExam(data.exam);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ачаалахад алдаа.");
      setExam(null);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEditMC = (q: QuestionRow) => {
    setEditId(q.id);
    setEditDraft(answersToDraft(q));
  };
  const closeEditMC = () => {
    setEditId(null);
    setEditDraft(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ асуултыг устгах уу?")) return;
    setDeletingId(id);
    try {
      await graphqlRequest(DELETE_QUESTION, { id });
      toast.success("Асуулт устгагдлаа.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteExam = async () => {
    if (!exam || !confirm("Шалгалтыг бүр мөсөн устгах уу?")) return;
    setDeletingExam(true);
    try {
      await graphqlRequest(DELETE_EXAM, { id: exam.id });
      toast.success("Шалгалт устгагдлаа.");
      router.push("/exams");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа.");
      setDeletingExam(false);
    }
  };

  if (!examId)
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">Буруу хаяг.</p>
      </div>
    );

  if (loading) {
    return <ExamDetailSkeleton />;
  }

  if (!exam) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" /> Буцах
        </Link>
        <p className="mt-6 text-slate-600">Шалгалт олдсонгүй.</p>
      </div>
    );
  }

  const questions = exam.questions ?? [];
  const mcQuestions = questions.filter(
    (q) => !q.question_type || q.question_type === "multiple_choice",
  );
  const oeQuestions = questions.filter((q) => q.question_type === "open_ended");

  return (
    <div className="min-h-screen bg-transparent">
      {/* Top Nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" /> Шалгалтууд
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
          onClick={() => void handleDeleteExam()}
          disabled={deletingExam}
        >
          {deletingExam ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Устгах
        </Button>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Exam Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {exam.title}
            </h1>
            {exam.course && (
              <p className="mt-1 text-sm font-medium ">
                {exam.course.code} · {exam.course.name}
              </p>
            )}
            {/* {exam.description && (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {exam.description}
              </p>
            )} */}
          </div>
          <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center justify-center gap-1 p-4">
              <Calendar className="size-4 text-slate-400" />
              <p className="text-xs text-slate-400 font-medium">Эхлэх өдөр</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(exam.start_time)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-4">
              <Clock className="size-4 text-slate-400" />
              <p className="text-xs text-slate-400 font-medium">Эхлэх цаг</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatTime(exam.start_time)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-4">
              <BookOpen className="size-4 text-slate-400" />
              <p className="text-xs text-slate-400 font-medium">Хугацаа</p>
              <p className="text-sm font-semibold text-slate-800">
                {exam.duration} мин
              </p>
            </div>
          </div>
        </div>
        {/* Add Questions */}
        <QuestionCreator examId={exam.id} onSaved={() => void load()} />

        {/* Multiple Choice Questions */}
        <QuestionSection
          title="Тест асуултууд"
          icon={<ListChecks className="size-4 text-slate-400" />}
          count={mcQuestions.length}
          emptyText="Тест асуулт байхгүй байна"
          emptyDesc="Доорх хэсгээс «Гараар» таб дээр нэмнэ үү"
        >
          {mcQuestions.map((q) => {
            const sorted = [...(q.answers ?? [])].sort((a, b) =>
              a.id && b.id ? a.id.localeCompare(b.id) : 0,
            );
            const diff = q.difficulty ? diffConfig[q.difficulty] : null;
            return (
              <QuestionCard
                key={q.id}
                idx={mcQuestions.indexOf(q)}
                text={q.text}
                imageUrl={q.image_url}
                diff={diff}
                badge={null}
                deletingId={deletingId}
                questionId={q.id}
                onEdit={() => openEditMC(q)}
                onDelete={() => void handleDelete(q.id)}
              >
                <ol className="space-y-1.5">
                  {sorted.map((a, i) => (
                    <li
                      key={a.id}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
                        a.is_correct
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-slate-50 border border-transparent"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          a.is_correct
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span
                        className={`flex-1 ${a.is_correct ? "font-medium text-emerald-800" : "text-slate-700"}`}
                      >
                        {a.text}
                      </span>
                      {a.is_correct && (
                        <Check className="size-4 text-emerald-600 shrink-0" />
                      )}
                    </li>
                  ))}
                </ol>
              </QuestionCard>
            );
          })}
        </QuestionSection>

        {/* Open-Ended Questions */}
        <QuestionSection
          title="Задгай асуултууд"
          icon={<AlignLeft className="size-4 text-slate-400" />}
          count={oeQuestions.length}
          emptyText="Задгай асуулт байхгүй байна"
          emptyDesc=""
        >
          {oeQuestions.map((q) => {
            const diff = q.difficulty ? diffConfig[q.difficulty] : null;
            return (
              <QuestionCard
                key={q.id}
                idx={oeQuestions.indexOf(q)}
                text={q.text}
                imageUrl={q.image_url}
                diff={diff}
                badge={
                  <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {q.max_points ?? 1} оноо
                  </span>
                }
                deletingId={deletingId}
                questionId={q.id}
                onEdit={() => setEditOpenQuestion(q)}
                onDelete={() => void handleDelete(q.id)}
              >
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <AlignLeft className="size-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700 font-medium">
                    Оюутнуудаас бичгээр хариулт авна
                  </p>
                </div>
              </QuestionCard>
            );
          })}
        </QuestionSection>
      </div>

      {/* Edit MC Dialog */}
      {editId && editDraft && (
        <AddQuestionManually
          examId={exam.id}
          open={!!editId}
          onOpenChange={(o: boolean) => {
            if (!o) closeEditMC();
          }}
          onSaved={() => {
            closeEditMC();
            void load();
          }}
          mode="edit"
          questionId={editId}
          initialDraft={editDraft}
        />
      )}

      {/* Edit Open-Ended Dialog */}
      {editOpenQuestion && (
        <EditOpenEndedDialog
          question={editOpenQuestion}
          open={!!editOpenQuestion}
          onOpenChange={(o: boolean) => {
            if (!o) setEditOpenQuestion(null);
          }}
          onSaved={() => {
            setEditOpenQuestion(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function ExamDetailSkeleton() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Top Nav Skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Exam Info Card Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="p-6 pb-4 space-y-3">
            <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center justify-center gap-1 p-4">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-4">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex flex-col items-center justify-center gap-1 p-4">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Question Creator Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-24 w-full bg-slate-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Multiple Choice Questions Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-5 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-7 h-7 bg-slate-200 rounded-full animate-pulse" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="border-t border-slate-100 px-5 py-3">
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                      >
                        <div className="w-5 h-5 bg-slate-200 rounded-full animate-pulse" />
                        <div className="h-4 flex-1 bg-slate-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open-Ended Questions Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-5 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 1 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 w-7 h-7 bg-slate-200 rounded-full animate-pulse" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
                        <div className="h-5 w-12 bg-slate-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="border-t border-slate-100 px-5 py-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50">
                    <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 flex-1 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function QuestionSection({
  title,
  icon,
  count,
  emptyText,
  emptyDesc,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  emptyText: string;
  emptyDesc: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <FileQuestion className="size-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">{emptyText}</p>
          <p className="text-xs text-slate-400">{emptyDesc}</p>
        </div>
      ) : (
        <ol className="space-y-3">{children}</ol>
      )}
    </div>
  );
}

function QuestionCard({
  idx,
  text,
  imageUrl,
  diff,
  badge,
  deletingId,
  questionId,
  onEdit,
  onDelete,
  children,
}: {
  idx: number;
  text: string;
  imageUrl?: string | null;
  diff: { label: string; cls: string } | null;
  badge: React.ReactNode;
  deletingId: string | null;
  questionId: string;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <li className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 leading-snug">{text}</p>
            {/* <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {diff && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${diff.cls}`}
                >
                  {diff.label}
                </span>
              )}
              {badge}
            </div> */}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            onClick={onEdit}
            aria-label="Засах"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            disabled={deletingId === questionId}
            onClick={onDelete}
            aria-label="Устгах"
          >
            {deletingId === questionId ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      </div>
      {imageUrl && (
        <div className="px-5 pb-3">
          <img
            src={imageUrl}
            alt="Асуултын зураг"
            className="max-h-56 w-full rounded-xl object-contain bg-slate-50 border border-slate-100"
          />
        </div>
      )}
      <div className="border-t border-slate-100 px-5 py-3">{children}</div>
    </li>
  );
}
