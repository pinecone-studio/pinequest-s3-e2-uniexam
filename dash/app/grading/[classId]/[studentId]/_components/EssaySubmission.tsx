"use client";

import { EssayQuestion } from "@/lib/grading/types";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

type EssaySubmissionProps = {
  essay: EssayQuestion;
  essayIndex: number;
  totalEssays: number;
  onPrev: () => void;
  onNext: () => void;
};

export const EssaySubmission = ({
  essay,
  essayIndex,
  totalEssays,
  onPrev,
  onNext,
}: EssaySubmissionProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            {essay.id}-р Асуулт
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {essay.question}
          </p>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-700">
                Оюутны Хариулт
              </span>
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
                <Pencil size={12} />
                Тэмдэглэх
              </button>
            </div>
            <div className="border border-gray-100 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed min-h-32">
              {essay.studentAnswer}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-4  flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={essayIndex === 0}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
          Өмнөх Эссе
        </button>

        <span className="text-sm text-gray-600">
          {essayIndex + 1} / {totalEssays} эссе
        </span>

        <button
          onClick={onNext}
          disabled={essayIndex === totalEssays - 1}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Дараах Эссе
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
