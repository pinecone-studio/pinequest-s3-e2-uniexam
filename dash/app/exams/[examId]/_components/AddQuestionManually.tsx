"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { graphqlRequest } from "@/lib/graphql";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExamQuestionCard } from "../../_components/ExamQuestionCard";
import {
  createEmptyQuestion,
  type ExamQuestionDraft,
} from "../../_components/exam-draft-types";

const ADD_MUTATION = `#graphql
  mutation AddManualQuestion(
    $exam_id: String!
    $content: String!
    $image_url: String
    $difficulty: QuestionDifficulty!
    $options: [String!]!
    $correctOptionIndex: Int!
  ) {
    addManualQuestionToExam(
      exam_id: $exam_id
      content: $content
      image_url: $image_url
      difficulty: $difficulty
      options: $options
      correctOptionIndex: $correctOptionIndex
    ) {
      id
    }
  }
`;

const UPDATE_MUTATION = `#graphql
  mutation UpdateManualQuestion(
    $id: String!
    $content: String!
    $image_url: String
    $difficulty: QuestionDifficulty!
    $options: [String!]!
    $correctOptionIndex: Int!
  ) {
    updateManualQuestion(
      id: $id
      content: $content
      image_url: $image_url
      difficulty: $difficulty
      options: $options
      correctOptionIndex: $correctOptionIndex
    ) {
      id
    }
  }
`;

type AddQuestionManuallyProps = {
  examId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  mode?: "add" | "edit";
  questionId?: string;
  initialDraft?: ExamQuestionDraft | null;
};

export function AddQuestionManually({
  examId,
  open,
  onOpenChange,
  onSaved,
  mode = "add",
  questionId,
  initialDraft,
}: AddQuestionManuallyProps) {
  const [draft, setDraft] = useState<ExamQuestionDraft>(createEmptyQuestion);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialDraft) {
      setDraft(initialDraft);
    } else {
      setDraft(createEmptyQuestion());
    }
  }, [open, mode, initialDraft]);

  const handleSave = async () => {
    if (uploading) {
      toast.error("Зураг upload дуусаагүй байна. Түр хүлээнэ үү.");
      return;
    }
    if (!draft.content.trim()) {
      toast.error("Асуултын текст оруулна уу.");
      return;
    }
    for (let i = 0; i < 5; i++) {
      if (!draft.options[i]?.trim()) {
        toast.error(`Сонголт ${i + 1} хоосон байна.`);
        return;
      }
    }

    setSaving(true);
    try {
      if (mode === "edit" && questionId) {
        await graphqlRequest(UPDATE_MUTATION, {
          id: questionId,
          content: draft.content,
          image_url: draft.image_url ?? null,
          difficulty: draft.difficulty,
          options: [...draft.options],
          correctOptionIndex: draft.correctOptionIndex,
        });
        toast.success("Асуулт шинэчлэгдлээ.");
      } else {
        await graphqlRequest(ADD_MUTATION, {
          exam_id: examId,
          content: draft.content,
          image_url: draft.image_url ?? null,
          difficulty: draft.difficulty,
          options: [...draft.options],
          correctOptionIndex: draft.correctOptionIndex,
        });
        toast.success("Асуулт нэмэгдлээ.");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!saving}
        className="sm:max-w-lg max-h-[min(90vh,720px)] flex flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-slate-100 px-5 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              {mode === "edit" ? "Асуулт засах" : "Шинэ асуулт нэмэх"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 min-h-0">
          <ExamQuestionCard
            index={0}
            question={draft}
            onChange={setDraft}
            onRemove={() => {}}
            canRemove={false}
            onUploadStateChange={setUploading}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="sm" disabled={saving}>
              Болих
            </Button>
          </DialogClose>
          <Button
            type="button"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[90px]"
            disabled={saving || uploading}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin mr-1.5 inline" />Хадгалж байна…</>
            ) : mode === "edit" ? (
              "Хадгалах"
            ) : (
              "Нэмэх"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
