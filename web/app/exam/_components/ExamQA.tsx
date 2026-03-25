"use client";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useExamState } from "../_hooks/use-exam-states";
import { useExamGuard } from "../_hooks/use-exam-guard";
import { Textarea } from "@/components/ui/textarea";

export const ExamQA = () => {
  const [violations, setViolations] = useState<string[]>([]);
  const [maxWarningsReached, setMaxWarningsReached] = useState(false);

  const onViolation = useCallback((type: string) => {
    setViolations((prev) => [...prev, type]);
  }, []);

  useExamGuard(onViolation, {
    maxWarnings: 3,
    onMaxWarnings: () => setMaxWarningsReached(true),
  });

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

  const answer = answers[currentId] ?? null;
  const isFlagged = flagged.includes(currentId);
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
  //   console.log({ answers });

  const lastViolation = violations[violations.length - 1];

  return (
    <div>
      <main className="flex-1 flex flex-col px-8 py-30 max-w-3xl mx-auto w-full">
        {maxWarningsReached && (
          <div
            className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            Та шалгалтын дүрмийг олон удаа зөрчлөө. Шалгуулагчид мэдэгдэнэ.
          </div>
        )}
        {violations.length > 0 && !maxWarningsReached && (
          <div
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            <span className="font-medium">Анхааруулга ({violations.length}/3): </span>
            {lastViolation}
          </div>
        )}

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
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                    : "border-gray-200 hover:border-indigo-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={choice.id}
                  checked={answer === choice.id}
                  onChange={() => handleAnswerChange(choice.id)}
                  className="accent-indigo-600"
                />
                <span className="font-medium uppercase text-xs text-gray-400 mr-1">
                  {choice.id}.
                </span>
                {choice.label}
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentQuestion.id === 1}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <button
            onClick={handleFlag}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition ${
              isFlagged
                ? "border-yellow-400 text-yellow-600 bg-yellow-50"
                : "border-gray-200 text-gray-500 hover:border-yellow-300"
            }`}
          >
            <Flag size={16} /> {isFlagged ? "Тэмдэглэсэн" : "Тэмдэглэх"}
          </button>

          <button
            onClick={handleNext}
            disabled={currentQuestion.id === totalQuestions}
            className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
};
