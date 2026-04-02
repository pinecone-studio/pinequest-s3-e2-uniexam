"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Trash2, X } from "lucide-react";
import type { ExamDifficulty, ExamQuestionDraft } from "./exam-draft-types";
import { uploadImageToCloudinary } from "@/lib/utils/imageUpload";
import { toast } from "sonner";

type ExamQuestionCardProps = {
  index: number;
  question: ExamQuestionDraft;
  onChange: (next: ExamQuestionDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
  onUploadStateChange?: (isUploading: boolean) => void;
};

const difficultyItems: { value: ExamDifficulty; label: string }[] = [
  { value: "easy", label: "Хялбар" },
  { value: "medium", label: "Дунд" },
  { value: "hard", label: "Хүнд" },
];

export function ExamQuestionCard({
  index,
  question,
  onChange,
  onRemove,
  canRemove,
  onUploadStateChange,
}: ExamQuestionCardProps) {
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState(false);

  const setOption = (optionIndex: number, value: string) => {
    const next = [...question.options];
    next[optionIndex] = value;
    onChange({ ...question, options: next as ExamQuestionDraft["options"] });
  };

  const handleQuestionImageSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    try {
      setUploadingQuestionImage(true);
      onUploadStateChange?.(true);
      const url = await uploadImageToCloudinary(file);
      onChange({ ...question, image_url: url });
      toast.success("Асуултын зураг амжилттай оруулагдлаа.");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Асуултын зураг оруулахад алдаа гарлаа.",
      );
    } finally {
      setUploadingQuestionImage(false);
      onUploadStateChange?.(false);
    }
  };

  return (
    <Card className="border-neutral-200 bg-white rounded-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-slate-800">
          Асуулт {index + 1}
        </CardTitle>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Асуулт хасах"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Field>
          <Label htmlFor={`q-${question.id}-content`}>Асуултын текст</Label>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="text-xs text-muted-foreground">
              Хэрвээ зурагтай асуулт бол эндээс зураг оруулж болно.
            </div>
            <div className="flex items-center gap-2">
              <input
                id={`q-${question.id}-question-image-file`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleQuestionImageSelect(e.target.files)}
              />
              <Label
                htmlFor={`q-${question.id}-question-image-file`}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-300 px-2 py-1 text-xs text-neutral-600 cursor-pointer hover:bg-neutral-50"
              >
                <ImageIcon className="size-3.5" />
                {uploadingQuestionImage ? "Түр хүлээнэ үү…" : "Асуултын зураг"}
              </Label>
              {question.image_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onChange({ ...question, image_url: null })}
                  aria-label="Асуултын зургийг арилгах"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
          <Textarea
            id={`q-${question.id}-content`}
            placeholder="Асуултаа бичнэ үү"
            value={question.content}
            onChange={(e) => onChange({ ...question, content: e.target.value })}
            rows={3}
            className="resize-y min-h-20"
          />
          {question.image_url && (
            <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
              <img
                src={question.image_url}
                alt="Асуултын зураг"
                className="max-h-64 w-full rounded-md object-contain"
              />
              <p className="mt-1 break-all text-[11px] text-muted-foreground">
                {question.image_url}
              </p>
            </div>
          )}
        </Field>

        <Field>
          <Label htmlFor={`q-${question.id}-diff`}>Хэцүүн</Label>
          <Select
            value={question.difficulty}
            onValueChange={(v) =>
              onChange({
                ...question,
                difficulty: v as ExamDifficulty,
              })
            }
          >
            <SelectTrigger id={`q-${question.id}-diff`} className="w-full">
              <SelectValue placeholder="Сонгох" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {difficultyItems.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="space-y-2">
          <Label>Сонголтууд (5)</Label>
          <p className="text-xs text-muted-foreground">
            Зөв хариултыг доорх радио товчоор сонгоно уу.
          </p>
          <RadioGroup
            value={String(question.correctOptionIndex)}
            onValueChange={(v) =>
              onChange({
                ...question,
                correctOptionIndex: Number.parseInt(v, 10),
              })
            }
            className="gap-3"
          >
            {question.options.map((opt, i) => {
              const inputId = `q-${question.id}-opt-${i}`;
              return (
                <div
                  key={`${question.id}-opt-${i}`}
                  className="flex items-center gap-2"
                >
                  <RadioGroupItem
                    value={String(i)}
                    id={`q-${question.id}-correct-${i}`}
                    className="shrink-0"
                  />
                  <Input
                    id={inputId}
                    aria-label={`Сонголт ${i + 1}`}
                    placeholder={`Сонголт ${i + 1}`}
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    className="flex-1"
                  />
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
