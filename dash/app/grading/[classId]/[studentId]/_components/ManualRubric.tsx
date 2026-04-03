"use client";

import { RubricCriterion } from "@/lib/grading/types";

type ManualRubricProps = {
  rubric: RubricCriterion[];
  onScoreChange: (criterionId: string, score: number) => void;
};

export const ManualRubric = ({ rubric, onScoreChange }: ManualRubricProps) => {
  const clampScore = (value: number, maxScore: number) =>
    Math.min(maxScore, Math.max(0, Math.round(value)));

  const applyScore = (criterionId: string, next: number, maxScore: number) => {
    onScoreChange(criterionId, clampScore(next, maxScore));
  };

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
            <div className="flex items-center gap-2 ">
              <button
                type="button"
                onClick={() =>
                  applyScore(
                    criterion.id,
                    criterion.score - 1,
                    criterion.maxScore,
                  )
                }
                className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                aria-label={`${criterion.name} оноог 1-ээр бууруулах`}
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={criterion.maxScore}
                step={1}
                value={criterion.score}
                onChange={(e) => {
                  if (e.target.value === "") return;
                  applyScore(
                    criterion.id,
                    Number(e.target.value),
                    criterion.maxScore,
                  );
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    applyScore(criterion.id, 0, criterion.maxScore);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const step = e.shiftKey ? 5 : 1;
                    const delta = e.key === "ArrowUp" ? step : -step;
                    applyScore(
                      criterion.id,
                      criterion.score + delta,
                      criterion.maxScore,
                    );
                  }
                }}
                className="h-8 w-16 rounded-md border border-gray-300 px-2 text-center text-sm font-semibold text-gray-800 [appearance:textfield]"
                aria-label={`${criterion.name} оноо`}
              />
              <span className="text-xs text-gray-400">
                / {criterion.maxScore}
              </span>
              <button
                type="button"
                onClick={() =>
                  applyScore(
                    criterion.id,
                    criterion.score + 1,
                    criterion.maxScore,
                  )
                }
                className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                aria-label={`${criterion.name} оноог 1-ээр нэмэх`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
