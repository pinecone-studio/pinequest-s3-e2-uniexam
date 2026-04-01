"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  Camera,
  ChartColumn,
  Clock,
  Keyboard,
  LibraryBig,
  NotebookText,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { PracticeHistoryEntry } from "./practiceTypes";
import type {
  PracticeDifficulty,
  PracticeExamSummary,
  PracticeMode,
} from "./practiceTypes";

type PracticeSetupProps = {
  exams: PracticeExamSummary[];
  examsLoading: boolean;
  examsError: string | null;
  practiceMode: PracticeMode;
  setPracticeMode: (mode: PracticeMode) => void;
  selectedExam: string | null;
  setSelectedExam: (id: string) => void;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string) => void;
  difficulty: PracticeDifficulty;
  setDifficulty: (value: PracticeDifficulty) => void;
  isGenerating: boolean;
  historyItems: PracticeHistoryEntry[];
  historyLoading: boolean;
  onStartPractice: () => void;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatDurationLabel = (seconds: number) => {
  if (seconds <= 0) {
    return "0 мин";
  }

  const hours = seconds / 3600;

  if (hours >= 1) {
    return `${hours.toFixed(1)}ц`;
  }

  return `${Math.max(1, Math.round(seconds / 60))} мин`;
};

export default function PracticeSetup({
  exams,
  examsLoading,
  examsError,
  practiceMode,
  setPracticeMode,
  selectedExam,
  setSelectedExam,
  selectedTopic,
  setSelectedTopic,
  difficulty,
  setDifficulty,
  isGenerating,
  historyItems,
  historyLoading,
  onStartPractice,
}: PracticeSetupProps) {
  const [referenceNow] = useState(() => new Date());
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const allTopics = Array.from(
    new Set(
      exams.flatMap((exam) =>
        [exam.courseName, exam.courseCode, exam.title].filter(Boolean),
      ),
    ),
  );
  const selectedExamDetails = exams.find((exam) => exam.id === selectedExam);
  const todayHistory = historyItems.filter((item) =>
    isSameDay(new Date(item.submittedAt), referenceNow),
  );
  const weeklyThreshold = referenceNow.getTime() - 7 * 24 * 60 * 60 * 1000;
  const weeklyHistory = historyItems.filter((item) => {
    const submittedAt = new Date(item.submittedAt).getTime();
    return Number.isFinite(submittedAt)
      ? submittedAt >= weeklyThreshold
      : false;
  });
  const answeredToday = todayHistory.reduce(
    (sum, item) => sum + item.totalQuestions,
    0,
  );
  const averageAccuracy = historyItems.length
    ? Math.round(
        (historyItems.reduce((sum, item) => sum + item.score, 0) /
          Math.max(
            1,
            historyItems.reduce((sum, item) => sum + item.totalQuestions, 0),
          )) *
          100,
      )
    : 0;
  const spentSecondsThisWeek = weeklyHistory.reduce(
    (sum, item) =>
      sum +
      (typeof item.durationSeconds === "number" &&
      Number.isFinite(item.durationSeconds)
        ? item.durationSeconds
        : 0),
    0,
  );
  const canStartPractice =
    !isGenerating &&
    (practiceMode === "exam" ? !!selectedExam : !!selectedTopic);

  const handleOpenWarning = () => {
    if (!canStartPractice) return;
    setIsWarningOpen(true);
  };

  const handleConfirmStartPractice = () => {
    setIsWarningOpen(false);
    onStartPractice();
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className={`cursor-pointer transition-all ${
            practiceMode === "exam"
              ? "border-primary ring-1 ring-[#006d77]"
              : "hover:border-primary/50"
          }`}
          onClick={() => setPracticeMode("exam")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f4f1]">
                <LibraryBig className="h-5 w-5 text-[#006d77]" />
              </div>
              <div>
                <CardTitle className="text-lg">Шалгалтаар бэлдэх</CardTitle>
                <CardDescription>
                  Тухайн шалгалтаас асуулт үүсгэх
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            practiceMode === "topic"
              ? "border-primary ring-1 ring-[#006d77]"
              : "hover:border-primary/50"
          }`}
          onClick={() => setPracticeMode("topic")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f4f1]">
                <NotebookText className="h-5 w-5 text-[#006d77]" />
              </div>
              <div>
                <CardTitle className="text-lg">Сэдвээр бэлдэх</CardTitle>
                <CardDescription>
                  Сайжруулахыг хүссэн сэдэв дээр төвлөрөх
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* <Sparkles className="h-5 w-5 text-primary" /> */}
            Тохиргоо
          </CardTitle>
          <CardDescription>
            Давтах шалгалтаа сонгон AI-аар асуултууд үүсгээрэй
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {practiceMode === "exam" ? (
            <div className="space-y-2">
              <Label>Ойрын шалгалтыг сонгох</Label>
              <Select
                value={selectedExam || ""}
                onValueChange={setSelectedExam}
                disabled={examsLoading || exams.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      examsLoading
                        ? "Шалгалтуудыг ачаалж байна..."
                        : "Давтлага хийх шалгалтаа сонгоно уу"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {exam.courseCode || exam.courseName}
                        </Badge>
                        <span>{exam.title}</span>
                        {exam.startTime ? (
                          <>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-muted-foreground">
                              {new Date(exam.startTime).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {examsError ? (
                <p className="text-sm text-red-600">{examsError}</p>
              ) : null}
              {selectedExam && (
                <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                  <h4 className="mb-2 font-medium">Сонгосон шалгалт:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-[#e6f4f1] text-[#006d77]"
                    >
                      {selectedExamDetails?.courseCode ||
                        selectedExamDetails?.courseName}
                    </Badge>
                    {selectedExamDetails?.startTime ? (
                      <Badge
                        variant="secondary"
                        className="bg-[#e6f4f1] text-[#006d77]"
                      >
                        {new Date(
                          selectedExamDetails.startTime,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Сэдэв сонгох</Label>
                <Select
                  value={selectedTopic || ""}
                  onValueChange={setSelectedTopic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Давтлага хийх сэдвээ сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Түвшин</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Хялбар</SelectItem>
                    <SelectItem value="medium">Дунд</SelectItem>
                    <SelectItem value="hard">Хүнд</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-[#006d77] hover:bg-[#086068] transition-colors duration-200 hover:cursor-pointer"
            size="lg"
            onClick={handleOpenWarning}
            disabled={!canStartPractice}
          >
            {isGenerating ? (
              <>
                {/* <Zap className="mr-2 h-4 w-4 animate-pulse" /> */}
                Асуулт үүсгэж байна...
              </>
            ) : (
              <>
                {/* <Sparkles className="mr-2 h-4 w-4" /> */}
                Асуулт үүсгэх
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
        <DialogContent className="p-0 sm:max-w-xl" showCloseButton={false}>
          <DialogHeader className="gap-1 border-b border-slate-100 px-7 py-5">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-[#d97706]" />
              Бэлтгэл шалгалтын өмнөх сануулга
            </DialogTitle>
            {/* <DialogDescription className="pl-7 text-xs text-slate-500">
              Шалгалтаа эхлүүлэхээс өмнө дараах мэдээлэлтэй танилцана уу.
            </DialogDescription> */}
            <DialogDescription className="pl-7 text-xs text-slate-500">
              Энэхүү анхааруулга нь бодит шалгалттай ойролцоо орчинд бэлтгэл
              хийхэд тань туслах зорилготой бөгөөд шалгалтын явцад ямар нөхцөл
              байдал үүсч болохыг урьдчилан мэдэж байх нь чухал юм.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-6 py-4">
            {practiceMode === "exam" && selectedExamDetails ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium text-[#006d77]">
                  {selectedExamDetails.courseCode ||
                    selectedExamDetails.courseName}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {selectedExamDetails.title}
                </h3>
              </div>
            ) : null}

            {practiceMode === "topic" && selectedTopic ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-medium text-[#006d77]">
                  Сэдвээр бэлдэх
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {selectedTopic}
                </h3>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Tab, focus, гарах оролдлогууд хянагдана
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Давтлагын тестийн үеэр tab солих, цонхны focus алдах, window
                    blur, цонхноос гарах, мөн асуултын хэсгээс гарах оролдлогууд
                    бүртгэгдэнэ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Камерын хяналт ажиллах боломжтой
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Хэрэв тухайн урсгалд камерын хяналт идэвхтэй байвал олон хүн
                    илрэх, царай харагдахгүй болох, доош удаан харах, эсвэл утас
                    харагдах үед систем анхааруулга өгнө.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Keyboard className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Shortcut болон хуулах үйлдэл хориотой
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ctrl, Alt, Meta товчлол, F12, PrintScreen, баруун товч,
                    copy, paste, cut зэрэг үйлдлүүдийг систем хориглож болно.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Анхааруулга !!!
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Бэлэн болсон үедээ давтлагын тестээ эхлүүлнэ үү.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-none border-t-0 bg-transparent px-6 pb-5 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsWarningOpen(false)}
            >
              Буцах
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStartPractice}
              className="bg-[#006d77]"
            >
              Асуулт үүсгэх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Өнөөдрийн явц</CardTitle>
            <ChartColumn className="h-4 w-4 text-[#006d77]" strokeWidth={2} />
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-12 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold">
                  {todayHistory.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {answeredToday} асуултанд хариулсан
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Зөв хариултын дундаж
            </CardTitle>
            <BadgePercent className="h-4 w-4 text-[#006d77]" strokeWidth={2} />
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-1.5 w-full animate-pulse rounded bg-slate-200" />
              </div>
            ) : (
              <>
                {/* <div className="text-2xl font-bold">{averageAccuracy}%</div>
                <Progress value={averageAccuracy} className="mt-2 h-1.5 " /> */}
                <div className="text-2xl font-semibold ">
                  {averageAccuracy}%
                </div>
                <Progress
                  value={averageAccuracy}
                  className="mt-2 h-1.5 **:data-[slot=progress-indicator]:bg-[#006d77] **:data-[slot=progress-indicator]:rounded-full"
                />
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Зарцуулсан хугацаа
            </CardTitle>
            <Clock className="h-4 w-4 text-[#006d77]" strokeWidth={2} />
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-semibold">
                  {formatDurationLabel(spentSecondsThisWeek)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Энэ долоо хоногт
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
