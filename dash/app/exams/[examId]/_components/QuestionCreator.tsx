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
  Sparkles,
  ListChecks,
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

type ParsedQuestion = {
  text?: string;
  options?: string[];
};

function parsedToDraft(p: ParsedQuestion): ExamQuestionDraft {
  const options = ["", "", "", "", ""] as [
    string,
    string,
    string,
    string,
    string,
  ];
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

export function QuestionCreator({
  examId,
  onSaved,
}: {
  examId: string;
  onSaved: () => void;
}) {
  const [activeTab, setActiveTab] = useState("text");
  const [drafts, setDrafts] = useState<ExamQuestionDraft[]>([
    createEmptyQuestion(),
  ]);
  const [saving, setSaving] = useState(false);
  const [uploadingByDraft, setUploadingByDraft] = useState<
    Record<string, boolean>
  >({});
  const hasUploading = Object.values(uploadingByDraft).some(Boolean);

  const [loadingOcr, setLoadingOcr] = useState(false);
  const [rawText, setRawText] = useState("");

  const [oeContent, setOeContent] = useState("");
  const [oeDifficulty, setOeDifficulty] = useState("medium");
  const [oeMaxPoints, setOeMaxPoints] = useState("1");
  const [oeImageUrl, setOeImageUrl] = useState<string | null>(null);
  const [oeUploading, setOeUploading] = useState(false);
  const [oeSaving, setOeSaving] = useState(false);

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

  const handleOcrUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setLoadingOcr(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);
    try {
      const response = await fetch(
        "https://tesseract-provider-production.up.railway.app/ocr",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!response.ok) throw new Error("Сервертэй холбогдоход алдаа гарлаа.");
      const data = await response.json();
      const parsed = parseRawTextToQuestions(data.aiCorrected || "");
      const newDrafts = parsed.map(parsedToDraft);
      if (newDrafts.length > 0) {
        setDrafts([
          ...drafts.filter((d) => d.content.trim() !== ""),
          ...newDrafts,
        ]);
        toast.success(`${newDrafts.length} асуулт танигдлаа.`);
        setActiveTab("manual");
      } else {
        toast.warning("Асуулт танигдсангүй, текст рүү хуулагдлаа.");
        setRawText(data.aiCorrected || "");
        setActiveTab("text");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Оруулж чадсангүй");
    } finally {
      setLoadingOcr(false);
    }
  };

  const handleTextParse = () => {
    const parsed = parseRawTextToQuestions(rawText);
    const newDrafts = parsed.map(parsedToDraft);
    if (newDrafts.length > 0) {
      setDrafts([
        ...drafts.filter((d) => d.content.trim() !== ""),
        ...newDrafts,
      ]);
      setRawText("");
      setActiveTab("manual");
      toast.success(`${newDrafts.length} асуулт хөрвүүлэгдлээ.`);
    } else {
      toast.error("Асуултын бүтэц олдсонгүй.");
    }
  };

  const handleSaveAll = async () => {
    if (hasUploading) {
      toast.error("Зураг upload дуусаагүй байна.");
      return;
    }
    for (const d of drafts) {
      if (!d.content.trim()) {
        toast.error("Бүх асуултын текстийг оруулна уу.");
        return;
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
    if (confirm("Бүх ноорог асуултыг устгах уу?"))
      setDrafts([createEmptyQuestion()]);
  };

  const handleSaveOpenEnded = async () => {
    if (!oeContent.trim()) {
      toast.error("Асуултын текст оруулна уу.");
      return;
    }
    const pts = parseInt(oeMaxPoints, 10);
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
      setOeImageUrl(null);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setOeSaving(false);
    }
  };

  return (
    <div className="border border-neutral-200 bg-white rounded-2xl">
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-neutral-500" />
          <h3 className="text-sm font-semibold text-neutral-800">
            Асуулт нэмэх
          </h3>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid h-9 w-full grid-cols-4 rounded-md bg-neutral-100 p-0.5">
            {[
              { id: "text", label: "Текстээс хуулах", icon: FileText },
              { id: "manual", label: "Тест гараар шивэх", icon: ListChecks },
              { id: "open", label: "Задгай даалгавар", icon: AlignLeft },
              { id: "ocr", label: "Зурагаас AI", icon: Sparkles },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 rounded-sm text-xs font-medium transition-colors data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=inactive]:text-neutral-500"
              >
                <tab.icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Open-ended tab */}
          <TabsContent value="open" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-500">
                  Асуулт
                </Label>
                <Textarea
                  className="min-h-28 resize-none rounded-md border-neutral-200 bg-white p-3 text-sm focus:ring-0"
                  placeholder="Оюутнаас бичгээр хариулт авах асуултаа энд бичнэ үү..."
                  value={oeContent}
                  onChange={(e) => setOeContent(e.target.value)}
                  disabled={oeSaving}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-neutral-500">
                    Хүндрэл
                  </Label>
                  <Select
                    value={oeDifficulty}
                    onValueChange={setOeDifficulty}
                    disabled={oeSaving}
                  >
                    <SelectTrigger className="h-9 rounded-md border-neutral-200 bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      <SelectItem value="easy">Хялбар</SelectItem>
                      <SelectItem value="medium">Дунд</SelectItem>
                      <SelectItem value="hard">Хүнд</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-neutral-500">
                    Дээд оноо
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 rounded-md border-neutral-200 bg-white text-sm focus:ring-0"
                    value={oeMaxPoints}
                    onChange={(e) => setOeMaxPoints(e.target.value)}
                    disabled={oeSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-neutral-500">
                    Зураг
                  </Label>
                  <div className="flex gap-2">
                    {oeImageUrl ? (
                      <div className="group relative size-9 overflow-hidden rounded-md border border-neutral-200">
                        <img
                          src={oeImageUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                        <button
                          onClick={() => setOeImageUrl(null)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 bg-white h-9 text-xs text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors">
                        <ImageIcon size={13} />
                        <span>Зураг</span>
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
                            } finally {
                              setOeUploading(false);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOeContent("Дараах даалгаврыг бодож хариуг бичнэ үү.");
                    setOeImageUrl(
                      "https://res.cloudinary.com/dczx8w4x1/image/upload/v1775129114/exam-options/ytadwklaurqvx6q6qjew.png",
                    );
                    toast.info("Жишээ хуулагдлаа");
                  }}
                  className="h-9 text-xs text-neutral-500"
                >
                  Жишээ оруулах
                </Button>
                <Button
                  onClick={() => void handleSaveOpenEnded()}
                  disabled={oeSaving || oeUploading || !oeContent.trim()}
                  className="h-9 rounded-md bg-neutral-900 px-5 text-xs font-medium text-white hover:bg-black"
                >
                  {oeSaving ? (
                    <Loader2 className="mr-1.5 animate-spin" size={13} />
                  ) : (
                    <CheckCircle2 className="mr-1.5" size={13} />
                  )}
                  {oeSaving ? "Хадгалж байна..." : "Асуултыг нэмэх"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* OCR tab */}
          <TabsContent value="ocr" className="mt-0">
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
              <Sparkles size={24} className="mb-3 text-neutral-400" />
              <h4 className="text-sm font-medium text-neutral-700">
                AI нь шалгалтын зургийг текст рүү хөрвүүлнэ.
              </h4>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleOcrUpload}
                className="hidden"
                id="creator-ocr"
                disabled={loadingOcr}
              />
              <label htmlFor="creator-ocr">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-6 rounded-md border-neutral-300 text-xs font-medium"
                >
                  <span>
                    {loadingOcr ? (
                      <Loader2 className="mr-1.5 animate-spin" size={13} />
                    ) : (
                      <UploadCloud className="mr-1.5" size={13} />
                    )}
                    {loadingOcr ? "Уншиж байна..." : "Зураг сонгох"}
                  </span>
                </Button>
              </label>
            </div>
          </TabsContent>

          {/* Text parse tab */}
          <TabsContent value="text" className="mt-0">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-500">
                  Текст өгөгдөл
                </Label>
                <Textarea
                  placeholder={
                    "Та бэлдсэн шалгалтын асуултаа энд copy-paste хийж оруулна уу."
                  }
                  className="min-h-30 resize-none rounded-md border-neutral-200 p-3 text-sm leading-relaxed focus:ring-0"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRawText(`1. Дараах бодомжуудаас аль нь зөв бэ? /1 оноо/
А. Нийгэм бол хүмүүсийн хамтын амьдрал, харилцаа холбооны систем мөн
В. Нийгэм бол төрийн харилцаа С. Нийгэм бол угсаатны харилцаа
D. Нийгэм бол хүмүүсийн соёлын харилцаа Е. Нийгэм бол хүний амьдрах орчин
2. Энгийн нийгмийн ялгагдах шинжид аль нь хамааралгүй вэ? /1 оноо/
А. Овог төрлийн холбоо В. Нийгмийн овгийн зохион байгуулалт
С. Эд хөрөнгийн ялгаагүй байдал D. Анги давхраа,төр үүссэн
Е. 50000-40000 жилийн өмнө үүссэн
3. Хүмүүс бие биетэйгээ харилцан үйлчлэх үйл явцыг юу гэж нэрлэдэг вэ? /1 оноо/
А. Нийгмийн харилцаа В. Нийгмийн харилцан үйлдэл С. Нийгмийн үйл ажиллагаа
D. Нийгмийн зан заншил Е. Нийгмийн хууль
4. Нийгмийн харилцааг эртний үед ямар арга хэрэгслээр зохицуулдаг байсан бэ? /1 оноо/
А. Ёс заншил В. Эрх зүй С. Хууль D. Зарлиг Е. Тогтоол шийдвэр`);
                    toast.info("Жишээ хуулагдлаа");
                  }}
                  className="h-9 text-xs text-neutral-500"
                >
                  Жишээ хуулах
                </Button>
                <Button
                  onClick={handleTextParse}
                  disabled={!rawText.trim()}
                  variant="outline"
                  className="h-9 rounded-md border-neutral-300 px-4 text-xs font-medium"
                >
                  <FileText className="mr-1.5" size={13} /> Асуулт болгох
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Manual tab */}
          <TabsContent value="manual" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-3">
                {drafts.map((draft, idx) => (
                  <ExamQuestionCard
                    key={draft.id}
                    index={idx}
                    question={draft}
                    onChange={(next) => handleChangeDraft(idx, next)}
                    onRemove={() => handleRemoveDraft(idx)}
                    canRemove={drafts.length > 1}
                    onUploadStateChange={(isUploading) =>
                      setUploadingByDraft((prev) => ({
                        ...prev,
                        [draft.id]: isUploading,
                      }))
                    }
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-neutral-100">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAddDraft}
                    className="rounded-md border-dashed border-neutral-300 text-xs font-medium text-neutral-500 hover:text-neutral-800"
                  >
                    <Plus className="mr-1.5" size={13} /> Асуулт нэмэх
                  </Button>
                  {drafts.length > 1 && (
                    <Button
                      variant="ghost"
                      onClick={clearDrafts}
                      className="size-9 rounded-md text-neutral-400 hover:text-neutral-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => void handleSaveAll()}
                  disabled={
                    saving ||
                    hasUploading ||
                    drafts.every((d) => !d.content.trim())
                  }
                  className="h-9 w-full rounded-md bg-neutral-900 px-5 text-xs font-medium text-white hover:bg-black sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 animate-spin" size={13} />
                  ) : (
                    <CheckCircle2 className="mr-1.5" size={13} />
                  )}
                  {saving
                    ? "Хадгалж байна..."
                    : `Бүх (${drafts.length}) асуултыг хадгалах`}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
