"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { graphqlRequest } from "@/lib/graphql";
import { Loader2, Plus, Sparkles, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { AIQuestionWizard } from "../[examId]/_components/AIQuestionWizard";
import { uploadImageToCloudinary } from "@/lib/utils/imageUpload";

const COURSES_QUERY = `#graphql
  query CoursesForExam {
    courses {
      id
      name
      code
    }
  }
`;

const CREATE_EXAM = `#graphql
  mutation CreateExamShell(
    $course_id: String!
    $title: String!
    $description: String
    $start_time: String!
    $end_time: String!
    $duration: Int!
    $type: String!
    $image_url: String
  ) {
    createExam(
      course_id: $course_id
      title: $title
      description: $description
      start_time: $start_time
      end_time: $end_time
      duration: $duration
      type: $type
      image_url: $image_url
    ) {
      id
      title
    }
  }
`;

type CourseRow = { id: string; name: string; code: string };

type CoursesData = { courses: CourseRow[] | null };
type CreateExamData = {
  createExam: { id: string; title: string } | null;
};

type Step = "shell" | "ai";

export const CreateNewExam = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("shell");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await graphqlRequest<CoursesData>(COURSES_QUERY);
      setCourses(data.courses ?? []);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Курсууд ачаалагдаагүй байна.",
      );
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadCourses();
    }
  }, [open, loadCourses]);

  const resetForm = () => {
    setStep("shell");
    setTitle("");
    setDescription("");
    setCourseId("");
    setExamDate("");
    setExamTime("09:00");
    setDurationMinutes("60");
    setImageUrl(null);
  };

  const fillDemoData = () => {
    setTitle("Програмчлалын үндэс - Дунд шатны сорил");
    setDescription(
      "Энэхүү шалгалт нь програмчлалын үндсэн ойлголтуудыг шалгах зорилготой.",
    );
    if (courses.length > 0) {
      setCourseId(courses[0].id);
    }
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    setExamDate(dateStr);
    setExamTime("14:00");
    setDurationMinutes("90");
    toast.info("Демо өгөгдлөөр бөглөлөө.");
  };

  const buildStartEndIso = () => {
    if (!examDate || !examTime) {
      throw new Error("Өдөр болон цагийг сонгоно уу.");
    }
    const [year, month, day] = examDate.split("-").map(Number);
    const [hours, minutes] = examTime.split(":").map(Number);
    const start = new Date(year, month - 1, day, hours, minutes);

    if (Number.isNaN(start.getTime())) {
      throw new Error("Огноо эсвэл цаг буруу байна.");
    }

    // UTC+8 цагийн зөрүүг нэмэх (Монгол улсын цагийн бүс)
    start.setHours(start.getHours() + 8);

    const dur = Number.parseInt(durationMinutes, 10);
    if (!Number.isFinite(dur) || dur <= 0) {
      throw new Error("Хугацаа зөв сонгоно уу.");
    }
    const end = new Date(start.getTime() + dur * 60 * 1000);
    return {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration: dur,
    };
  };

  const handleCreateShell = async () => {
    if (!title.trim()) {
      toast.error("Шалгалтын нэр оруулна уу.");
      return;
    }
    if (!courseId) {
      toast.error("Курс сонгоно уу.");
      return;
    }
    if (uploading) {
      toast.error("Зураг хуулж байна. Түр хүлээнэ үү.");
      return;
    }

    let timing: { start_time: string; end_time: string; duration: number };
    try {
      timing = buildStartEndIso();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Огноо алдаатай.");
      return;
    }

    setSaving(true);
    try {
      const data = await graphqlRequest<CreateExamData>(CREATE_EXAM, {
        course_id: courseId,
        title: title.trim(),
        description: description.trim() || null,
        start_time: timing.start_time,
        end_time: timing.end_time,
        duration: timing.duration,
        type: "mock",
        image_url: imageUrl,
      });
      const id = data.createExam?.id;
      if (!id) throw new Error("Шалгалтын ID ирээгүй.");
      toast.success("Шалгалт үүслээ. Асуултуудаа нэмнэ үү.");
      setOpen(false);
      resetForm();
      router.push(`/exams/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Үүсгэхэд алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setStep("shell");
        }
        if (!next) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#31A8E0] hover:bg-[#1fa8bb] text-white gap-2 shadow-sm">
          <Plus size={16} /> Шалгалт нэмэх
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!saving}
        className="sm:max-w-md max-h-[min(90vh,720px)] flex flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-slate-100 px-5 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              {step === "shell" && "Шинэ шалгалт үүсгэх"}
              {step === "ai" && "AI туслах"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 min-h-0">
          {step === "shell" && (
            <FieldGroup className="gap-4">
              <Field>
                <Label htmlFor="exam-name">Шалгалтын нэр</Label>
                <Input
                  id="exam-name"
                  placeholder="Жишээ: Математикийн сорил"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                />
              </Field>
              <Field>
                <Label htmlFor="course">Хичээл</Label>
                <Select
                  value={courseId || undefined}
                  onValueChange={setCourseId}
                  disabled={saving || coursesLoading}
                >
                  <SelectTrigger id="course">
                    <SelectValue
                      placeholder={
                        coursesLoading ? "Ачаалж байна…" : "Хичээл сонгох"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="w-(--radix-select-trigger-width) z-100"
                  >
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label htmlFor="date">Эхлэх өдөр</Label>
                  <Input
                    id="date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    disabled={saving}
                  />
                </Field>
                <Field>
                  <Label htmlFor="time">Эхлэх цаг</Label>
                  <Input
                    id="time"
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    disabled={saving}
                  />
                </Field>
              </div>
              <Field>
                <Label htmlFor="duration">Үргэлжлэх хугацаа</Label>
                <Select
                  value={durationMinutes}
                  onValueChange={setDurationMinutes}
                  disabled={saving}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Сонгох" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="w-(--radix-select-trigger-width) z-50"
                  >
                    <SelectItem value="20">20 минут</SelectItem>
                    <SelectItem value="30">30 минут</SelectItem>
                    <SelectItem value="40">40 минут</SelectItem>
                    <SelectItem value="60">1 цаг</SelectItem>
                    <SelectItem value="90">1 цаг 30 минут</SelectItem>
                    <SelectItem value="120">2 цаг</SelectItem>
                    <SelectItem value="180">3 цаг</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label>Шалгалтын ковер зураг (заавал биш)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {imageUrl ? (
                    <div className="relative size-20 rounded-lg border overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Exam cover"
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-white"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center size-20 rounded-lg border border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                      <ImageIcon className="size-6 text-slate-400" />
                      <span className="text-[10px] text-slate-500 mt-1">
                        Зураг
                      </span>
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
                    <Loader2 className="size-5 animate-spin text-[#006fee]" />
                  )}
                </div>
              </Field>
            </FieldGroup>
          )}

          {step === "ai" && (
            <AIQuestionWizard onBack={() => setStep("shell")} />
          )}
        </div>

        {step === "shell" && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillDemoData}
              disabled={saving}
              className="text-[#31A8E0] border-[#31A8E0] hover:bg-blue-50"
            >
              Демо бөглөх
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                >
                  Болих
                </Button>
              </DialogClose>
              <Button
                type="button"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-27.5"
                onClick={() => void handleCreateShell()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1.5 inline" />
                    Үүсгэж байна…
                  </>
                ) : (
                  "Үргэлжлүүлэх"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
