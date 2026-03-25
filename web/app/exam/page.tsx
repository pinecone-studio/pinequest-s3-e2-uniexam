"use client";
import { ExamHeader, ExamQA, ExamProgressBar } from "./_components/index";
import { useExamState } from "./_hooks/use-exam-states";

const Exam = () => {
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

export default Exam;
