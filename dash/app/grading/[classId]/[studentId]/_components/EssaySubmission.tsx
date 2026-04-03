"use client";

import { EssayQuestion } from "@/lib/grading/types";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

type EssaySubmissionProps = {
  essay: EssayQuestion;
  essayIndex: number;
  totalEssays: number;
  onSelectEssay: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export const EssaySubmission = ({
  essay,
  essayIndex,
  totalEssays,
  onSelectEssay,
  onPrev,
  onNext,
}: EssaySubmissionProps) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="border border-gray-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            {essay.id}-р Асуулт
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-5">
            {essay.question}
          </p>

          {essay.questionImageUrl ? (
            <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={essay.questionImageUrl}
                alt={`${essay.id}-р асуултын зураг`}
                className="max-h-[420px] w-full object-contain"
              />
            </div>
          ) : null}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-700">
                Оюутны Хариулт
              </span>
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#31A8E0] transition-colors">
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
          className="flex items-center gap-1.5 text-sm text-gray-800 font-medium hover:bg-white  disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-200 py-1 px-2 rounded-md shadow-xs"
        >
          <ChevronLeft size={16} />
          Өмнөх Эссе
        </button>

        <div className="flex max-w-[320px] items-center gap-2 overflow-x-auto px-2">
          {Array.from({ length: totalEssays }).map((_, index) => {
            const isActive = index === essayIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectEssay(index)}
                className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium transition ${
                  isActive
                    ? "border-[#31A8E0] bg-[#31A8E0] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
                aria-label={`${index + 1}-р эссэ рүү шилжих`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={essayIndex === totalEssays - 1}
          className="flex items-center gap-1.5 text-sm text-gray-800 font-medium hover:bg-white  disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-200 py-1 px-2 rounded-md shadow-xs"
        >
          Дараах Эссе
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
