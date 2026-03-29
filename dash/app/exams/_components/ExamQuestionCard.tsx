"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Trash2 } from "lucide-react";
import type { ExamDifficulty, ExamQuestionDraft } from "./exam-draft-types";

type ExamQuestionCardProps = {
  index: number;
  question: ExamQuestionDraft;
  onChange: (next: ExamQuestionDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
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
}: ExamQuestionCardProps) {
  const setOption = (optionIndex: number, value: string) => {
    const next = [...question.options];
    next[optionIndex] = value;
    onChange({ ...question, options: next as ExamQuestionDraft["options"] });
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
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
          <Textarea
            id={`q-${question.id}-content`}
            placeholder="Асуултаа бичнэ үү"
            value={question.content}
            onChange={(e) =>
              onChange({ ...question, content: e.target.value })
            }
            rows={3}
            className="resize-y min-h-[80px]"
          />
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
            {question.options.map((opt, i) => (
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
                  id={`q-${question.id}-opt-${i}`}
                  aria-label={`Сонголт ${i + 1}`}
                  placeholder={`Сонголт ${i + 1}`}
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
