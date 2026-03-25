"use client";
import { Button } from "@/components/ui/button";
import { useExamState } from "../_hooks/use-exam-states";
import ExamTimer from "./ExamTimer";
import { CircleCheckBig, Flag, Send } from "lucide-react";

export const ExamProgressBar = () => {
  const { totalQuestions, currentId, answers, flagged, setCurrentId } =
    useExamState();
  return (
    <div className="border-l bg-muted/30 p-6 flex flex-col w-80">
      <ExamTimer />
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3 ">Асуултууд</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((q) => (
            <Button
              key={q}
              onClick={() => setCurrentId(q)}
              className={`rounded-full p-5 items-center ${
                q === currentId
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : flagged.includes(q)
                    ? "bg-amber-200 border-2 border-amber-400 text-amber-800 hover:bg-amber-300"
                    : answers[q] !== undefined && answers[q] !== null
                      ? "bg-indigo-200 border-2 border-indigo-700 text-indigo-800 hover:bg-indigo-300"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
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
            <span className="w-3 h-3 rounded-full bg-indigo-700 inline-block" />
            Одоогийн
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-indigo-700 bg-indigo-200 inline-block" />
            Хариулсан
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-200 inline-block" />
            Тэмдэглэсэн
          </span>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm  mb-2">
            <span className="text-muted-foreground">Явц</span>
            <span className="font-medium ">too %</span>
          </div>
          <div className="w-full bg-muted overflow-hidden rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all"
              // style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm  mt-3">
            <span className="flex gap-1.5 items-center">
              <CircleCheckBig size={15} color="#303F9F" /> too/{totalQuestions}
            </span>
            <span className="flex gap-1.5 items-center">
              <Flag size={15} color="#FFA000" /> too тэмдэглэсэн
            </span>
          </div>
        </div>
      </div>
      <Button className="flex items-center gap-3 rounded-md w-full px-6 py-5 bg-indigo-700">
        <Send />
        Submit Exam
      </Button>
    </div>
  );
};
