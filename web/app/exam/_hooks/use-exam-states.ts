import { useState } from "react";
import { mockExam } from "../mockExamData";

export const useExamState = () => {
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
    // state: { currentId, answers, flagged },
    // setters: { setCurrentId, setAnswers, setFlagged },
    // computed: { totalQuestions, currentQuestion, answeredCount },

    // handlers: {

    // },
  };
};
