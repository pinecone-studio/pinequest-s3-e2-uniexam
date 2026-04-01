"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  AlignLeft,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ExamQuestionCard } from "../../_components/ExamQuestionCard";
import {
  createEmptyQuestion,
  type ExamQuestionDraft,
} from "../../_components/exam-draft-types";
import { parseRawTextToQuestions } from "./QuestionParser";
import { graphqlRequest } from "@/lib/graphql";
import { uploadImageToCloudinary } from "@/lib/utils/imageUpload";

// ─── GraphQL Mutations ─────────────────────────────────────────────────────

const ADD_MC_MUTATION = `#graphql
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

const ADD_OPEN_ENDED_MUTATION = `#graphql
  mutation AddOpenEndedQuestion(
    $exam_id: String!
    $content: String!
    $image_url: String
    $difficulty: QuestionDifficulty!
    $max_points: Int
  ) {
    addOpenEndedQuestion(
      exam_id: $exam_id
      content: $content
      image_url: $image_url
      difficulty: $difficulty
      max_points: $max_points
    ) {
      id
    }
  }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────

function parsedToDraft(p: any): ExamQuestionDraft {
  const options = ["", "", "", "", ""] as [string, string, string, string, string];
  if (p.options && Array.isArray(p.options)) {
    p.options.slice(0, 5).forEach((opt: string, idx: number) => {
      options[idx] = opt;
    });
  }
  return {
    id: crypto.randomUUID(),
    content: p.text || "",
    image_url: null,
    difficulty: "medium",
    options,
    correctOptionIndex: 0,
  };
}

// ─── Main Component ────────────────────────────────────────────────────────

export function QuestionCreator({
  examId,
  onSaved,
}: {
  examId: string;
  onSaved: () => void;
}) {
  const [activeTab, setActiveTab] = useState("manual");

  // Multiple-choice draft state
  const [drafts, setDrafts] = useState<ExamQuestionDraft[]>([createEmptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [uploadingByDraft, setUploadingByDraft] = useState<Record<string, boolean>>({});
  const hasUploading = Object.values(uploadingByDraft).some(Boolean);

  // OCR / text-parse state
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [rawText, setRawText] = useState("");

  // Open-ended state
  const [oeContent, setOeContent] = useState("");
  const [oeDifficulty, setOeDifficulty] = useState("medium");
  const [oeMaxPoints, setOeMaxPoints] = useState("1");
  const [oeImageUrl, setOeImageUrl] = useState<string | null>(null);
  const [oeUploading, setOeUploading] = useState(false);
  const [oeSaving, setOeSaving] = useState(false);

  // ── Multiple-choice handlers ──────────────────────────────────────────

  const handleAddDraft = () => setDrafts([...drafts, createEmptyQuestion()]);

  const handleRemoveDraft = (index: number) => {
    const toRemove = drafts[index];
    setDrafts(drafts.filter((_, i) => i !== index));
    if (toRemove?.id) {
      setUploadingByDraft((prev) => {
        const next = { ...prev };
        delete next[toRemove.id];
        return next;
      });
    }
  };

  const handleChangeDraft = (index: number, next: ExamQuestionDraft) => {
    const newDrafts = [...drafts];
    newDrafts[index] = next;
    setDrafts(newDrafts);
  };

  const handleOcrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setLoadingOcr(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    try {
      const response = await fetch(
        "https://tesseract-provider-production.up.railway.app/ocr",
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Сервертэй холбогдоход алдаа гарлаа.");
      const data = await response.json();
      const parsed = parseRawTextToQuestions(data.aiCorrected || "");
      const newDrafts = parsed.map(parsedToDraft);
      if (newDrafts.length > 0) {
        setDrafts([...drafts.filter((d) => d.content.trim() !== ""), ...newDrafts]);
        toast.success(`${newDrafts.length} асуулт танигдлаа.`);
        setActiveTab("manual");
      } else {
        toast.warning("Асуулт танигдсангүй, текст рүү хуулагдлаа.");
        setRawText(data.aiCorrected || "");
        setActiveTab("text");
      }
    } catch (err: any) {
      toast.error(err.message || "Оруулж чадсангүй");
    } finally {
      setLoadingOcr(false);
    }
  };

  const handleTextParse = () => {
    const parsed = parseRawTextToQuestions(rawText);
    const newDrafts = parsed.map(parsedToDraft);
    if (newDrafts.length > 0) {
      setDrafts([...drafts.filter((d) => d.content.trim() !== ""), ...newDrafts]);
      setRawText("");
      setActiveTab("manual");
      toast.success(`${newDrafts.length} асуулт хөрвүүлэгдлээ.`);
    } else {
      toast.error("Асуултын бүтэц олдсонгүй.");
    }
  };

  const handleSaveAll = async () => {
    if (hasUploading) {
      toast.error("Зураг upload дуусаагүй байна. Түр хүлээгээд дахин оролдоно уу.");
      return;
    }
    for (let j = 0; j < drafts.length; j++) {
      const d = drafts[j];
      if (!d.content.trim()) {
        toast.error(`Асуулт ${j + 1}-н текстийг оруулна уу.`);
        return;
      }
      for (let i = 0; i < 5; i++) {
        if (!d.options[i]?.trim()) d.options[i] = "-";
      }
    }
    setSaving(true);
    try {
      for (const draft of drafts) {
        await graphqlRequest(ADD_MC_MUTATION, {
          exam_id: examId,
          content: draft.content,
          image_url: draft.image_url ?? null,
          difficulty: draft.difficulty,
          options: [...draft.options],
          correctOptionIndex: draft.correctOptionIndex,
        });
      }
      toast.success("Асуултууд амжилттай хадгалагдлаа.");
      setDrafts([createEmptyQuestion()]);
      setUploadingByDraft({});
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  const clearDrafts = () => {
    if (confirm("Бүх ноорог асуултыг устгах уу?")) {
      setDrafts([createEmptyQuestion()]);
    }
  };

  // ── Open-ended handlers ───────────────────────────────────────────────

  const handleSaveOpenEnded = async () => {
    if (!oeContent.trim()) {
      toast.error("Асуултын текст оруулна уу.");
      return;
    }
    const pts = parseInt(oeMaxPoints, 10);
    if (!Number.isFinite(pts) || pts < 1) {
      toast.error("Оноо 1-ээс дээш байх ёстой.");
      return;
    }
    setOeSaving(true);
    try {
      await graphqlRequest(ADD_OPEN_ENDED_MUTATION, {
        exam_id: examId,
        content: oeContent.trim(),
        image_url: oeImageUrl ?? null,
        difficulty: oeDifficulty,
        max_points: pts,
      });
      toast.success("Задгай асуулт нэмэгдлээ.");
      setOeContent("");
      setOeDifficulty("medium");
      setOeMaxPoints("1");
      setOeImageUrl(null);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setOeSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Асуулт нэмэх</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Тест (A/B/C/D/E), задгай даалгавар, зургаас таних, эсвэл текстээс хөрвүүлэх
        </p>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 p-1 rounded-xl h-auto">
            <TabsTrigger value="manual" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <Plus className="size-4 mr-1.5" />
              Тест
            </TabsTrigger>
            <TabsTrigger value="open" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <AlignLeft className="size-4 mr-1.5" />
              Задгай
            </TabsTrigger>
            <TabsTrigger value="ocr" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <UploadCloud className="size-4 mr-1.5" />
              Зургаас
            </TabsTrigger>
            <TabsTrigger value="text" className="py-2 text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
              <FileText className="size-4 mr-1.5" />
              Текстээс
            </TabsTrigger>
          </TabsList>

          {/* ── Open-Ended Tab ── */}
          <TabsContent value="open" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Асуултын текст</Label>
                <Textarea
                  className="mt-1 resize-none min-h-[100px] rounded-xl border-slate-200 text-sm"
                  placeholder="Оюутнаас бичгээр хариулт авах асуултаа бичнэ үү...&#10;Жишээ: Монгол улсын нийслэл хотын тухай товч бичнэ үү."
                  value={oeContent}
                  onChange={(e) => setOeContent(e.target.value)}
                  disabled={oeSaving}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Хэцүүн</Label>
                  <Select value={oeDifficulty} onValueChange={setOeDifficulty} disabled={oeSaving}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Хялбар</SelectItem>
                      <SelectItem value="medium">Дунд</SelectItem>
                      <SelectItem value="hard">Хүнд</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Дээд оноо</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    className="mt-1"
                    value={oeMaxPoints}
                    onChange={(e) => setOeMaxPoints(e.target.value)}
                    disabled={oeSaving}
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <Label className="text-sm font-medium text-slate-700">
                  Зураг{" "}
                  <span className="text-slate-400 font-normal">(заавал биш)</span>
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  {oeImageUrl ? (
                    <div className="relative size-24 rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                      <img src={oeImageUrl} alt="" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setOeImageUrl(null)}
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
                        disabled={oeUploading || oeSaving}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setOeUploading(true);
                          try {
                            const url = await uploadImageToCloudinary(file);
                            setOeImageUrl(url);
                          } catch {
                            toast.error("Зураг хуулахад алдаа гарлаа.");
                          } finally {
                            setOeUploading(false);
                          }
                        }}
                      />
                    </label>
                  )}
                  {oeUploading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="size-4 animate-spin text-blue-500" />
                      <span>Хуулж байна...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <AlignLeft className="size-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Задгай даалгавраар оюутнуудаас бичгээр хариулт авна.
                  Хариулт нь автоматаар шалгагдахгүй — багш гараар дүгнэлт өгнө.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
                  onClick={() => void handleSaveOpenEnded()}
                  disabled={oeSaving || oeUploading || !oeContent.trim()}
                >
                  {oeSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {oeSaving ? "Хадгалж байна..." : "Асуулт нэмэх"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── OCR Tab ── */}
          <TabsContent value="ocr" className="mt-4">
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
              <UploadCloud className="size-10 text-slate-400 mx-auto mb-3" />
              <p className="font-medium text-slate-700 mb-1">Зургаас асуулт таних</p>
              <p className="text-sm text-slate-500 mb-4">
                Шалгалтын материалын зургийг оруулахад автоматаар асуулт болгоно
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleOcrUpload}
                className="hidden"
                id="ocr-upload"
                disabled={loadingOcr}
              />
              <label htmlFor="ocr-upload">
                <Button
                  asChild
                  disabled={loadingOcr}
                  size="sm"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span>
                    {loadingOcr && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {loadingOcr ? "Тайлж байна..." : "Зураг сонгох"}
                  </span>
                </Button>
              </label>
            </div>
          </TabsContent>

          {/* ── Text Tab ── */}
          <TabsContent value="text" className="mt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Дугаарласан асуулт болон хариултуудаа энд бичнэ үү:
              </p>
              <Textarea
                placeholder={"1. Монгол улсын нийслэл?\na) Улаанбаатар\nb) Дархан\nc) Эрдэнэт\nd) Ховд\ne) Дорнод\n\n2. Дараагийн асуулт..."}
                className="min-h-[180px] bg-white text-sm resize-none border-slate-200 rounded-lg"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleTextParse}
                  disabled={!rawText.trim()}
                  size="sm"
                  className="gap-2 bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <FileText className="size-4" />
                  Асуулт болгох
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Manual hidden placeholder ── */}
          <TabsContent value="manual" className="mt-0" />
        </Tabs>

        {/* ── MC Draft Questions (only shown on manual/import tabs) ── */}
        {(activeTab === "manual" || activeTab === "ocr" || activeTab === "text") && (
          <div className="space-y-4">
            {drafts.map((draft, idx) => (
              <ExamQuestionCard
                key={draft.id}
                index={idx}
                question={draft}
                onChange={(next) => handleChangeDraft(idx, next)}
                onRemove={() => handleRemoveDraft(idx)}
                canRemove={drafts.length > 1}
                onUploadStateChange={(isUploading) =>
                  setUploadingByDraft((prev) => ({ ...prev, [draft.id]: isUploading }))
                }
              />
            ))}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-dashed border-2 hover:bg-slate-50 text-slate-600 w-full sm:w-auto"
                  onClick={handleAddDraft}
                >
                  <Plus className="size-4" />
                  Асуулт нэмэх
                </Button>
                {drafts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Бүгдийг устгах"
                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                    onClick={clearDrafts}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
                onClick={() => void handleSaveAll()}
                disabled={saving || hasUploading || drafts.length === 0}
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {saving ? "Хадгалж байна..." : `Хадгалах (${drafts.length})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
