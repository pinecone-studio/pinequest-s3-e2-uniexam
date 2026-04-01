"use client";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useExamState } from "../_hooks/use-exam-states";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getQuestionTypeLabel } from "@/lib/question-type-label";
import {
  EXAM_WARNING_CODES,
  useExamWarningTracker,
} from "../_hooks/use-exam-warning-tracker";

export const ExamQA = () => {
  const {
    totalQuestions,
    currentQuestion,
    answers,
    flagged,
    currentId,
    setCurrentId,
    setAnswers,
    setFlagged,
  } = useExamState();
  const { recordWarning } = useExamWarningTracker();

  const answer = answers[currentId] ?? null;
  const isFlagged = flagged.includes(currentId);
  const isFirstQuestion = currentId === 1;
  const isLastQuestion = currentId === totalQuestions;
  const wordCount =
    answer === null ? 0 : answer.toString().trim().split(/\s+/).length;

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentId]: value }));
  };

  const handleFlag = () => {
    setFlagged((prev) =>
      isFlagged ? prev.filter((id) => id !== currentId) : [...prev, currentId],
    );
  };

  const handleNext = () => {
    if (currentId < totalQuestions) setCurrentId(currentId + 1);
  };

  const handleBack = () => {
    if (currentId > 1) setCurrentId(currentId - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "Shift"
    ) {
      return;
    }

    if (
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.key === "PrintScreen" ||
      e.key === "F12"
    ) {
      recordWarning(EXAM_WARNING_CODES.keyboardShortcut);
      e.preventDefault();
      toast.error(`Товчлол ашиглах хориотой: ${e.key}`);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    recordWarning(EXAM_WARNING_CODES.contextMenu);
    e.preventDefault();
    toast.error("Хулганы баруун товч ашиглах хориотой!");
  };

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    recordWarning(EXAM_WARNING_CODES.clipboardBlocked);
    e.preventDefault();
    toast.error("Хуулах/Буулгах үйлдэл хориотой!");
  };
  //   console.log({ answers });

  return (
    <div>
      <main className="flex-1 flex flex-col px-8 py-30 max-w-3xl mx-auto w-full">
        <span className="mb-3 inline-flex w-fit rounded-full bg-[#e6f4f1] px-3 py-1 text-xs font-semibold text-[#006d77]">
          {getQuestionTypeLabel(currentQuestion.type)}
        </span>
        <p className="text-gray-800 text-base font-medium mb-6">
          {currentQuestion.question}
        </p>

        {currentQuestion.type === "Short Answer" ? (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
              Таны хариулт
            </label>
            <Textarea
              className="w-full border border-gray-200 rounded-lg p-4 text-sm text-gray-800 resize-none min-h-40 transition focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-200"
              placeholder="Хариултаа энд бичнэ үү..."
              value={answer?.toString() ?? ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onContextMenu={handleContextMenu}
              onCopy={handleCopyPaste}
              onPaste={handleCopyPaste}
              onCut={handleCopyPaste}
            />
            <span className="text-xs text-gray-400 text-right">
              {wordCount} үг
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {currentQuestion.choices?.map((choice) => (
              <label
                key={choice.id}
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer text-sm transition-all ${
                  answer === choice.id
                    ? "border-[#006d77] bg-[#e6f4f1] text-[#006d77]"
                    : "border-gray-200 text-gray-700 hover:border-[#bfe3dd]"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={choice.id}
                  checked={answer === choice.id}
                  onChange={() => handleAnswerChange(choice.id)}
                  className="accent-[#006d77]"
                />
                <span className="font-medium uppercase text-xs text-gray-400 mr-1">
                  {choice.id}.
                </span>
                {choice.label}
              </label>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 items-center font-medium">
          <button
            onClick={handleBack}
            disabled={isFirstQuestion}
            className="flex items-center justify-self-start gap-1 text-sm text-gray-500 transition hover:text-[#006d77] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Буцах
          </button>

          <button
            onClick={handleFlag}
            className={`flex items-center justify-self-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
              isFlagged
                ? "border-yellow-400 text-yellow-600 bg-yellow-50"
                : "border-gray-200 text-gray-500 hover:border-yellow-300"
            }`}
          >
            <Flag size={16} /> {isFlagged ? "Тэмдэглэсэн" : "Тэмдэглэх"}
          </button>

          {isLastQuestion ? null : (
            <button
              onClick={handleNext}
              className="flex items-center justify-self-end gap-2 rounded-lg bg-[#006d77] px-5 py-2 text-sm text-white transition hover:bg-[#00565e]"
            >
              Цааш <ChevronRight size={16} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
