"use client";

import { ExamHeader, ExamProgressBar, ExamQA } from "./_components";
import { ExamProvider, useExamState } from "./_hooks/use-exam-states";

const Exam = () => {
  return (
    <ExamProvider>
      <ExamContent />
    </ExamProvider>
  );
};

export default Exam;

export const ExamContent = () => {
  const { setAnswers, currentId } = useExamState();

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentId]: Number(value) }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <ExamHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ExamQA />
        </div>
        <ExamProgressBar />
      </div>
    </div>
  );
};
