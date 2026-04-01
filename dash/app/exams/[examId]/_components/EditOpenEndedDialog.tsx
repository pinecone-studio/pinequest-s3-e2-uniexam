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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { graphqlRequest } from "@/lib/graphql";
import { Loader2, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/lib/utils/imageUpload";

const UPDATE_OPEN_ENDED = `#graphql
  mutation UpdateOpenEndedQuestion(
    $id: String!
    $content: String!
    $image_url: String
    $difficulty: QuestionDifficulty!
    $max_points: Int
  ) {
    updateOpenEndedQuestion(
      id: $id
      content: $content
      image_url: $image_url
      difficulty: $difficulty
      max_points: $max_points
    ) {
      id
    }
  }
`;

type QuestionRow = {
  id: string;
  text: string;
  image_url?: string | null;
  difficulty: string | null;
  max_points?: number | null;
};

export function EditOpenEndedDialog({
  question,
  open,
  onOpenChange,
  onSaved,
}: {
  question: QuestionRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(question.text);
  const [difficulty, setDifficulty] = useState(question.difficulty ?? "medium");
  const [maxPoints, setMaxPoints] = useState(String(question.max_points ?? 1));
  const [imageUrl, setImageUrl] = useState<string | null>(question.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(question.text);
      setDifficulty(question.difficulty ?? "medium");
      setMaxPoints(String(question.max_points ?? 1));
      setImageUrl(question.image_url ?? null);
    }
  }, [open, question]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Асуултын текст оруулна уу.");
      return;
    }
    const pts = parseInt(maxPoints, 10);
    if (!Number.isFinite(pts) || pts < 1) {
      toast.error("Оноо 1-ээс дээш байх ёстой.");
      return;
    }
    setSaving(true);
    try {
      await graphqlRequest(UPDATE_OPEN_ENDED, {
        id: question.id,
        content: content.trim(),
        image_url: imageUrl ?? null,
        difficulty,
        max_points: pts,
      });
      toast.success("Асуулт шинэчлэгдлээ.");
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
        className="sm:max-w-lg max-h-[min(90vh,680px)] flex flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-slate-100 px-5 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Задгай асуулт засах
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 min-h-0">
          <FieldGroup className="gap-4">
            <Field>
              <Label className="text-sm font-medium text-slate-700">Асуултын текст</Label>
              <Textarea
                className="mt-1 resize-none min-h-[100px] rounded-xl border-slate-200"
                placeholder="Асуултаа дэлгэрэнгүй бичнэ үү..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
                rows={4}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label className="text-sm font-medium text-slate-700">Хэцүүн</Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                  disabled={saving}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Хялбар</SelectItem>
                    <SelectItem value="medium">Дунд</SelectItem>
                    <SelectItem value="hard">Хүнд</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label className="text-sm font-medium text-slate-700">Дээд оноо</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  className="mt-1"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  disabled={saving}
                />
              </Field>
            </div>

            <Field>
              <Label className="text-sm font-medium text-slate-700">
                Зураг{" "}
                <span className="text-slate-400 font-normal">(заавал биш)</span>
              </Label>
              <div className="mt-2 flex items-center gap-3">
                {imageUrl ? (
                  <div className="relative size-24 rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                    <img src={imageUrl} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center size-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-300 hover:bg-blue-50/60 transition-all">
                    <ImageIcon className="size-5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 mt-1 font-medium">Зураг нэмэх</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const url = await uploadImageToCloudinary(file);
                          setImageUrl(url);
                        } catch {
                          toast.error("Зураг хуулахад алдаа гарлаа.");
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  </label>
                )}
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="size-4 animate-spin text-blue-500" />
                    <span>Хуулж байна...</span>
                  </div>
                )}
              </div>
            </Field>
          </FieldGroup>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="sm" disabled={saving}>
              Болих
            </Button>
          </DialogClose>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[90px]"
            disabled={saving || uploading}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin mr-1.5 inline" />Хадгалж байна…</>
            ) : (
              "Хадгалах"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
