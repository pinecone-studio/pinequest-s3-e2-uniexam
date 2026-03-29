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
    $difficulty: QuestionDifficulty!
    $options: [String!]!
    $correctOptionIndex: Int!
  ) {
    addManualQuestionToExam(
      exam_id: $exam_id
      content: $content
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
    $difficulty: QuestionDifficulty!
    $options: [String!]!
    $correctOptionIndex: Int!
  ) {
    updateManualQuestion(
      id: $id
      content: $content
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

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialDraft) {
      setDraft(initialDraft);
    } else {
      setDraft(createEmptyQuestion());
    }
  }, [open, mode, initialDraft]);

  const handleSave = async () => {
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
          difficulty: draft.difficulty,
          options: [...draft.options],
          correctOptionIndex: draft.correctOptionIndex,
        });
        toast.success("Асуулт шинэчлэгдлээ.");
      } else {
        await graphqlRequest(ADD_MUTATION, {
          exam_id: examId,
          content: draft.content,
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
        <div className="border-b border-border/80 px-4 py-3 shrink-0">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Асуулт засах" : "Гараар асуулт нэмэх"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-4 min-h-0">
          <ExamQuestionCard
            index={0}
            question={draft}
            onChange={setDraft}
            onRemove={() => {}}
            canRemove={false}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-border/80 bg-muted/20 px-4 py-3 shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={saving}>
              Болих
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-[#006fee] hover:bg-[#005bc4] text-white"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2 inline" />
                Хадгалж байна…
              </>
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
