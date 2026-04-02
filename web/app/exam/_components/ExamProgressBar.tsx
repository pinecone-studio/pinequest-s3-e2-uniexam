"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { submitExamToBackend } from "@/lib/exam-submissions";
import { useExamState } from "../_hooks/use-exam-states";
import ExamTimer from "./ExamTimer";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getScheduledEndsAtMs,
  getScheduledStartedAtIso,
} from "../exam-schedule";
import { useExamWarningTracker } from "../_hooks/use-exam-warning-tracker";
import { getExamReturnToFromSearchParams } from "@/lib/exam-navigation";

const AUTO_SUBMITTED_ERROR_MESSAGE =
  "Exam time is over. Submission has been auto-submitted.";

export const ExamProgressBar = () => {
  const {
    exam,
    questions,
    totalQuestions,
    currentId,
    answers,
    flagged,
    setCurrentId,
    setAnswers,
    answeredCount,
    sessionStatus,
    setSessionStatus,
    clearSavedExam,
  } = useExamState();
  const { flushWarningLogs } = useExamWarningTracker();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progress = Math.round((answeredCount / totalQuestions) * 100);
  const scheduledEndsAtMs = getScheduledEndsAtMs(exam);
  const isExamLocked = sessionStatus !== "active";
  const returnTo = getExamReturnToFromSearchParams(searchParams);

  const getStartedAt = () => {
    // exam.startTime байвал шууд тэрийг ашигла, localStorage хэрэггүй
    if (exam.startTime) {
      return getScheduledStartedAtIso(exam, scheduledEndsAtMs);
    }

    if (typeof window === "undefined") {
      return getScheduledStartedAtIso(exam, scheduledEndsAtMs);
    }

    const endsAt = localStorage.getItem(`exam-ends-at:${exam.id}`);
    const endsAtTime = endsAt ? Number(endsAt) : NaN;

    return getScheduledStartedAtIso(
      exam,
      Number.isFinite(endsAtTime) ? endsAtTime : scheduledEndsAtMs,
    );
  };

  const handleDemoFill = () => {
    const demoAnswers = questions.reduce<Record<number, string | null>>(
      (result, question) => {
        if (question.type === "Short Answer") {
          result[question.id] =
            question.correctAnswer.trim() || `Demo хариулт ${question.id}`;
          return result;
        }

        result[question.id] =
          question.correctAnswer || question.choices?.[0]?.id || null;
        return result;
      },
      {},
    );

    setAnswers(demoAnswers);
    setCurrentId(1);
    toast.success("Demo хариултууд автоматаар бөглөгдлөө.");
  };

  const handleFinishExam = async ({
    autoSubmit = false,
  }: {
    autoSubmit?: boolean;
  } = {}) => {
    if (isSubmitting || isExamLocked) {
      return;
    }

    if (!isLoaded) {
      toast.error("Хэрэглэгчийн мэдээлэл ачаалж байна.");
      return;
    }

    const studentEmail = user?.primaryEmailAddress?.emailAddress;
    const studentName =
      user?.fullName || user?.username || studentEmail || "Student";

    if (!studentEmail) {
      toast.error("Хэрэглэгчийн имэйл олдсонгүй.");
      return;
    }

    setSessionStatus(autoSubmit ? "auto_submitting" : "manual_submitting");
    setIsSubmitting(true);

    try {
      await flushWarningLogs();

      await submitExamToBackend({
        studentEmail,
        studentName,
        examId: exam.id,
        startedAt: getStartedAt(),
        submittedAt: new Date().toISOString(),
        questions,
        answers,
      });

      clearSavedExam();
      setSessionStatus("submitted");
      toast.success("Шалгалт амжилттай илгээгдлээ");
      router.push(returnTo);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Шалгалтын хариулт хадгалахад алдаа гарлаа.";

      if (errorMessage === AUTO_SUBMITTED_ERROR_MESSAGE) {
        clearSavedExam();
        setSessionStatus("submitted");
        toast.error(errorMessage);
        router.push(returnTo);
        return;
      }

      setSessionStatus("active");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-l bg-muted/30 p-6 flex flex-col w-80">
      <ExamTimer
        durationSeconds={exam.durationSeconds}
        storageKey={`exam-ends-at:${exam.id}`}
        scheduledEndsAtMs={scheduledEndsAtMs}
        onTimeUp={() => handleFinishExam({ autoSubmit: true })}
      />
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3 ">Асуултууд</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((q) => (
            <Button
              key={q}
              onClick={() => setCurrentId(q)}
              className={`rounded-full p-5 items-center border-2! ${
                q === currentId
                  ? "border-transparent bg-[#006d77] text-white hover:bg-[#00565e]"
                  : flagged.includes(q)
                    ? "bg-amber-200 border-amber-400 text-amber-800 hover:bg-amber-300"
                    : answers[q] !== undefined && answers[q] !== null
                      ? "border-[#006d77] bg-[#e6f4f1] text-[#006d77] hover:bg-[#d7ebe6]"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground border-transparent"
              }`}
            >
              {q}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-gray-300 bg-muted inline-block" />
            Хариулаагүй
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-[#006d77]" />
            Одоогийн
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-[#006d77] bg-[#e6f4f1]" />
            Хариулсан
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-200 inline-block" />
            Тэмдэглэсэн
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Явц</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-muted overflow-hidden rounded-full h-2">
            <div
              className="h-2 rounded-full bg-[#006d77] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Button
          onClick={handleDemoFill}
          disabled={isSubmitting || isExamLocked}
          className="flex w-full items-center gap-3 rounded-md border border-[#bfe3dd] bg-[#e6f4f1] px-6 py-5 font-semibold text-[#006d77] hover:bg-[#d7ebe6]"
        >
          <Sparkles />
          Demo бөглөх
        </Button>
        <Button
          onClick={() => handleFinishExam()}
          disabled={isSubmitting || isExamLocked}
          className="flex w-full items-center gap-3 rounded-md bg-[#006d77] px-6 py-5 font-semibold text-white hover:bg-[#00565e]"
        >
          <Send />
          {isSubmitting ? "Хадгалж байна..." : "Шалгалт Дуусгах"}
        </Button>
      </div>
    </div>
  );
};
