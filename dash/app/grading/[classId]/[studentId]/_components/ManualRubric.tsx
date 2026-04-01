"use client";

import { RubricCriterion } from "@/lib/grading/types";

type ManualRubricProps = {
  rubric: RubricCriterion[];
  onScoreChange: (criterionId: string, score: number) => void;
};

export const ManualRubric = ({ rubric, onScoreChange }: ManualRubricProps) => {
  const totalEarned = rubric.reduce((sum, c) => sum + c.score, 0);
  const totalMax = rubric.reduce((sum, c) => sum + c.maxScore, 0);
  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-800">Рубрик Оноо</h4>
        <span className="text-sm font-bold text-gray-700">
          {totalEarned}/{totalMax}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {rubric.map((criterion) => (
          <div key={criterion.id}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {criterion.name}
                </p>
                <p className="text-xs text-gray-400">{criterion.description}</p>
              </div>
              <span className="text-sm font-bold text-gray-800 ml-3 whitespace-nowrap">
                {criterion.score}/{criterion.maxScore}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={criterion.maxScore}
              step={1}
              value={criterion.score}
              onChange={(e) =>
                onScoreChange(criterion.id, Number(e.target.value))
              }
              className="w-full h-1.5 rounded-full border-none outline-0 cursor-pointer"
            />
            {/* <Slider               min={0}
              max={criterion.maxScore}
              step={1}
              value={criterion.score}
              onChange={(e) =>
                onScoreChange(criterion.id, Number(e.target.value))
              }/> */}
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>0</span>
              <span>{criterion.maxScore}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
