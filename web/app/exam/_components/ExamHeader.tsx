import React from "react";
import { useExamState } from "../_hooks/use-exam-states";

export const ExamHeader = () => {
  const { totalQuestions } = useExamState();
  return (
    <div className="border-b px-6 py-4">
      <div className="flex justify-between">
        <p>Exam title</p>
        <p>0 of {totalQuestions} answered</p>
      </div>
    </div>
  );
};
