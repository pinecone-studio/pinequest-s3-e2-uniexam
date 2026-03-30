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
import { ArrowLeft, Loader2, Plus, PenLine, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIQuestionWizard } from "../[examId]/_components/AIQuestionWizard";

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
  ) {
    createExam(
      course_id: $course_id
      title: $title
      description: $description
      start_time: $start_time
      end_time: $end_time
      duration: $duration
      type: $type
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

type Step = "pick" | "shell" | "ai";

export const CreateNewExam = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [saving, setSaving] = useState(false);

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
    setStep("pick");
    setTitle("");
    setDescription("");
    setCourseId("");
    setExamDate("");
    setExamTime("09:00");
    setDurationMinutes("60");
  };

  const buildStartEndIso = () => {
    if (!examDate || !examTime) {
      throw new Error("Өдөр болон цагийг сонгоно уу.");
    }
    const start = new Date(`${examDate}T${examTime}:00`);
    if (Number.isNaN(start.getTime())) {
      throw new Error("Огноо эсвэл цаг буруу байна.");
    }
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
        type: "manual",
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
        if (!next) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#006fee] hover:bg-[#005bc4] text-white flex gap-2">
          <Plus size={18} /> Шалгалт үүсгэх
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!saving}
        className="sm:max-w-md max-h-[min(90vh,720px)] flex flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-border/80 px-4 py-3 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {step === "pick" && "Шинэ шалгалт"}
              {step === "shell" && "Гараар үүсгэх"}
              {step === "ai" && "AI туслах"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {step === "pick" && "Үүсгэх аргаа сонгоно уу."}
              {step === "shell" &&
                "Үндсэн мэдээллээ оруулна уу. Асуултуудаа дараагийн алхамд нэмнэ."}
              {step === "ai" && "AI урсгалаа энд холбоно."}
            </p>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 min-h-0">
          {step === "pick" && (
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setStep("shell")}
                className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#006fee]/10 text-[#006fee]">
                  <PenLine className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Гараар</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Эхлээд шалгалтын мэдээллээ оруулж, асуултуудаа дараа нь
                    нэмнэ.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setStep("ai")}
                className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-700">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">AI</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AI тусламжтайгаар асуулт бэлтгэх (та өөрөө холбоно).
                  </p>
                </div>
              </button>
            </div>
          )}

          {step === "shell" && (
            <FieldGroup className="gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 w-fit gap-1 text-muted-foreground"
                onClick={() => setStep("pick")}
                disabled={saving}
              >
                <ArrowLeft className="size-4" />
                Буцах
              </Button>
              <Field>
                <Label htmlFor="exam-name">Шалгалтын нэр</Label>
                <Input
                  id="exam-name"
                  placeholder="Жишээ: Дунд шалгалт"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                />
              </Field>
              <Field>
                <Label htmlFor="exam-desc">Тайлбар (заавал биш)</Label>
                <Input
                  id="exam-desc"
                  placeholder="Товч тайлбар"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </Field>
              <Field>
                <Label htmlFor="course">Курс</Label>
                <Select
                  value={courseId || undefined}
                  onValueChange={setCourseId}
                  disabled={saving || coursesLoading}
                >
                  <SelectTrigger id="course">
                    <SelectValue
                      placeholder={
                        coursesLoading ? "Ачаалж байна…" : "Курс сонгох"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="w-[var(--radix-select-trigger-width)] z-[100]"
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
                    className="w-[var(--radix-select-trigger-width)] z-[50]"
                  >
                    <SelectItem value="60">1 цаг</SelectItem>
                    <SelectItem value="120">2 цаг</SelectItem>
                    <SelectItem value="180">3 цаг</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          )}

          {step === "ai" && <AIQuestionWizard onBack={() => setStep("pick")} />}
        </div>

        {step === "shell" && (
          <div className="flex justify-end gap-3 border-t border-border/80 bg-muted/20 px-4 py-3 shrink-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={saving}>
                Болих
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-[#006fee] hover:bg-[#005bc4] text-white min-w-[120px]"
              onClick={() => void handleCreateShell()}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2 inline" />
                  Үүсгэж байна…
                </>
              ) : (
                "Үргэлжлүүлэх"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
