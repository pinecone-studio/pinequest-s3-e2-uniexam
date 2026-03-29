"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { graphqlRequest } from "@/lib/graphql";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddQuestionManually } from "./_components/AddQuestionManually";
import { AIQuestionWizard } from "./_components/AIQuestionWizard";
import type { ExamDifficulty, ExamQuestionDraft } from "../_components/exam-draft-types";

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
        order_index
        difficulty
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

type AnswerRow = {
  id: string;
  text: string;
  is_correct: boolean;
};

type QuestionRow = {
  id: string;
  text: string;
  order_index: number | null;
  difficulty: string | null;
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
  const sorted = [...(q.answers ?? [])].sort((a, b) => {
    if (a.id && b.id) return a.id.localeCompare(b.id);
    return 0;
  });
  const options = ["", "", "", "", ""] as ExamQuestionDraft["options"];
  sorted.slice(0, 5).forEach((a, i) => {
    options[i] = a.text;
  });
  const correct = sorted.findIndex((a) => a.is_correct);
  const d = (q.difficulty ?? "medium") as ExamDifficulty;
  return {
    id: q.id,
    content: q.text ?? "",
    difficulty: ["easy", "medium", "hard"].includes(d) ? d : "medium",
    options,
    correctOptionIndex: correct >= 0 ? correct : 0,
  };
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const diffLabel: Record<string, string> = {
  easy: "Хялбар",
  medium: "Дунд",
  hard: "Хүнд",
};

export default function ExamDetailPage() {
  const params = useParams();
  const examId = typeof params.examId === "string" ? params.examId : "";

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<ExamQuestionDraft | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const openEdit = (q: QuestionRow) => {
    setAddOpen(false);
    setEditId(q.id);
    setEditDraft(answersToDraft(q));
  };

  const closeEdit = () => {
    setEditId(null);
    setEditDraft(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ асуултыг устгах уу?")) return;
    setDeletingId(id);
    try {
      await graphqlRequest(DELETE_QUESTION, { id });
      toast.success("Устгагдлаа.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!examId) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Буруу хаяг.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Буцах
        </Link>
        <p className="mt-6 text-slate-600">Шалгалт олдсонгүй.</p>
      </div>
    );
  }

  const questions = exam.questions ?? [];

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" />
          Шалгалтууд
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {exam.title}
          </h1>
          {exam.course && (
            <p className="mt-1 text-sm text-slate-500">
              {exam.course.code} · {exam.course.name}
            </p>
          )}
          {exam.description && (
            <p className="mt-3 text-sm text-slate-600">{exam.description}</p>
          )}
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
            <div>
              <dt className="text-muted-foreground">Эхлэх</dt>
              <dd>{formatWhen(exam.start_time)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Дуусах</dt>
              <dd>{formatWhen(exam.end_time)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Хугацаа</dt>
              <dd>{exam.duration} мин</dd>
            </div>
          </dl>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            className="bg-[#006fee] hover:bg-[#005bc4] text-white gap-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" />
            Гараар нэмэх
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAiOpen(true)}>
            <Sparkles className="size-4" />
            AI туслах
          </Button>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Асуултууд ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-white px-4 py-12 text-center text-sm text-muted-foreground">
              Асуулт байхгүй. Дээрх товчоор нэмнэ үү.
            </p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q, idx) => {
                const sorted = [...(q.answers ?? [])].sort((a, b) => {
                  if (a.id && b.id) return a.id.localeCompare(b.id);
                  return 0;
                });
                const diff = q.difficulty ? diffLabel[q.difficulty] ?? q.difficulty : "—";
                return (
                  <li
                    key={q.id}
                    className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          #{idx + 1} · {diff}
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{q.text}</p>
                        <ol className="mt-3 space-y-1.5 text-sm text-slate-700">
                          {sorted.map((a, i) => (
                            <li
                              key={a.id}
                              className="flex items-start gap-2 rounded-md bg-slate-50/80 px-2 py-1.5"
                            >
                              <span className="text-muted-foreground tabular-nums w-5 shrink-0">
                                {i + 1}.
                              </span>
                              <span className="flex-1">{a.text}</span>
                              {a.is_correct && (
                                <Check
                                  className="size-4 shrink-0 text-emerald-600"
                                  aria-label="Зөв"
                                />
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground"
                          onClick={() => openEdit(q)}
                          aria-label="Засах"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deletingId === q.id}
                          onClick={() => void handleDelete(q.id)}
                          aria-label="Устгах"
                        >
                          {deletingId === q.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <AddQuestionManually
        examId={exam.id}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => void load()}
        mode="add"
      />

      {editId && editDraft && (
        <AddQuestionManually
          examId={exam.id}
          open={!!editId}
          onOpenChange={(o) => {
            if (!o) closeEdit();
          }}
          onSaved={() => {
            closeEdit();
            void load();
          }}
          mode="edit"
          questionId={editId}
          initialDraft={editDraft}
        />
      )}

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI туслах</DialogTitle>
          </DialogHeader>
          <AIQuestionWizard onBack={() => setAiOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
