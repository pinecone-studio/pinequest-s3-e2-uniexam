import { Button } from "@/components/ui/button";
import { useExamState } from "../_hooks/use-exam-states";
import ExamTimer from "./ExamTimer";
import { CircleCheckBig, Flag, Send } from "lucide-react";

export const ExamProgressBar = () => {
  const { totalQuestions } = useExamState();
  return (
    <div className="border-l bg-muted/30 p-6 flex flex-col w-80">
      <ExamTimer />
      <div>
        <div className="px-4">
          <h3>Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
              (q) => (
                <Button
                  className="rounded-full bg-muted hover:bg-muted/80 p-5 items-center text-muted-foreground"
                  key={q}
                >
                  {q}
                </Button>
              ),
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
              Хариулаагүй
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              Одоогийн
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-200 inline-block" />
              Хариулсан
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              Тэмдэглэсэн
            </span>
          </div>
        </div>
        <div className="px-4 mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium">Явц</span>
            <span>%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              // style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span className="flex gap-2 items-center">
              <CircleCheckBig size={14} /> too/{totalQuestions}
            </span>
            <span className="flex gap-2 items-center">
              <Flag size={14} /> too тэмдэглэсэн
            </span>
          </div>
        </div>
        <Button className="flex items-center rounded-md w-full px-6 py-5">
          <Send />
          Submit Exam
        </Button>
      </div>
    </div>
  );
};
