"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ExamMeta, ExamQuestion } from "../exam-types";

type SavedExamState = {
  currentId: number;
  answers: Record<number, string | null>;
  flagged: number[];
};

const getExamDraftStorageKey = (examId: string) => `exam-draft:${examId}`;
const getExamEndsAtStorageKey = (examId: string) => `exam-ends-at:${examId}`;

const getInitialExamState = (examId: string): SavedExamState => {
  if (typeof window === "undefined") {
    return {
      currentId: 1,
      answers: {},
      flagged: [],
    };
  }

  const savedDraft = localStorage.getItem(getExamDraftStorageKey(examId));

  if (!savedDraft) {
    return {
      currentId: 1,
      answers: {},
      flagged: [],
    };
  }

  try {
    const parsedDraft: SavedExamState = JSON.parse(savedDraft);
    return {
      currentId: parsedDraft.currentId ?? 1,
      answers: parsedDraft.answers ?? {},
      flagged: parsedDraft.flagged ?? [],
    };
  } catch {
    localStorage.removeItem(getExamDraftStorageKey(examId));
    return {
      currentId: 1,
      answers: {},
      flagged: [],
    };
  }
};

const ExamContext = createContext<ReturnType<
  typeof useExamStateInternal
> | null>(null);

const useExamStateInternal = ({
  exam,
  questions,
}: {
  exam: ExamMeta;
  questions: ExamQuestion[];
}) => {
  const initialState = getInitialExamState(exam.id);
  const [currentId, setCurrentId] = useState<number>(initialState.currentId);
  const [answers, setAnswers] = useState<Record<number, string | null>>(
    initialState.answers,
  );
  const [flagged, setFlagged] = useState<number[]>(initialState.flagged);

  useEffect(() => {
    const endsAtStorageKey = getExamEndsAtStorageKey(exam.id);
    const savedEndsAt = localStorage.getItem(endsAtStorageKey);

    if (!savedEndsAt) {
      const endsAt = Date.now() + exam.durationSeconds * 1000;
      localStorage.setItem(endsAtStorageKey, endsAt.toString());
    }
  }, [exam.durationSeconds, exam.id]);

  useEffect(() => {
    const payload: SavedExamState = {
      currentId,
      answers,
      flagged,
    };

    localStorage.setItem(
      getExamDraftStorageKey(exam.id),
      JSON.stringify(payload),
    );
  }, [answers, currentId, exam.id, flagged]);

  const totalQuestions = questions.length;
  const safeCurrentId =
    totalQuestions === 0 ? 1 : Math.min(Math.max(currentId, 1), totalQuestions);
  const currentQuestion = questions[safeCurrentId - 1] ?? questions[0];
  const answeredCount = Object.values(answers).filter((a) => a !== null).length;

  const clearSavedExam = () => {
    localStorage.removeItem(getExamDraftStorageKey(exam.id));
    localStorage.removeItem(getExamEndsAtStorageKey(exam.id));
  };

  return {
    exam,
    currentId: safeCurrentId,
    answers,
    flagged,
    totalQuestions,
    currentQuestion,
    answeredCount,
    setCurrentId,
    setAnswers,
    setFlagged,
    clearSavedExam,
  };
};

export const ExamProvider = ({
  children,
  exam,
  questions,
}: {
  children: ReactNode;
  exam: ExamMeta;
  questions: ExamQuestion[];
}) => {
  const value = useExamStateInternal({ exam, questions });
  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
};

export const useExamState = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExamState must be used within ExamProvider");
  return ctx;
};
