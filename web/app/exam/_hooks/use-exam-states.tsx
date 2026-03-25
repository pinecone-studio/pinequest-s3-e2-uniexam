"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { mockExam } from "../mockExamData";

const ExamContext = createContext<ReturnType<
  typeof useExamStateInternal
> | null>(null);

const useExamStateInternal = () => {
  const [currentId, setCurrentId] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [flagged, setFlagged] = useState<number[]>([]);

  const totalQuestions = mockExam.length;
  const currentQuestion = mockExam[currentId - 1];
  const answeredCount = Object.values(answers).filter((a) => a !== null).length;

  return {
    currentId,
    answers,
    flagged,
    totalQuestions,
    currentQuestion,
    answeredCount,
    setCurrentId,
    setAnswers,
    setFlagged,
  };
};

export const ExamProvider = ({ children }: { children: ReactNode }) => {
  const value = useExamStateInternal();
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};

export const useExamState = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExamState must be used within ExamProvider");
  return ctx;
};
