"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { examName, mockExam } from "../mockExamData";

const EXAM_DRAFT_STORAGE_KEY = "exam-draft";
const EXAM_ENDS_AT_STORAGE_KEY = "exam-ends-at";

type SavedExamState = {
  currentId: number;
  answers: Record<number, string | null>;
  flagged: number[];
};

const getInitialExamState = (): SavedExamState => {
  if (typeof window === "undefined") {
    return {
      currentId: 1,
      answers: {},
      flagged: [],
    };
  }

  const savedDraft = localStorage.getItem(EXAM_DRAFT_STORAGE_KEY);

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
    localStorage.removeItem(EXAM_DRAFT_STORAGE_KEY);
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

const useExamStateInternal = () => {
  const initialState = getInitialExamState();
  const [currentId, setCurrentId] = useState<number>(initialState.currentId);
  const [answers, setAnswers] = useState<Record<number, string | null>>(
    initialState.answers,
  );
  const [flagged, setFlagged] = useState<number[]>(initialState.flagged);

  useEffect(() => {
    const savedEndsAt = localStorage.getItem(EXAM_ENDS_AT_STORAGE_KEY);

    if (!savedEndsAt) {
      const endsAt = Date.now() + examName.durationSeconds * 1000;
      localStorage.setItem(EXAM_ENDS_AT_STORAGE_KEY, endsAt.toString());
    }
  }, []);

  useEffect(() => {
    const payload: SavedExamState = {
      currentId,
      answers,
      flagged,
    };

    localStorage.setItem(EXAM_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }, [answers, currentId, flagged]);

  const totalQuestions = mockExam.length;
  const currentQuestion = mockExam[currentId - 1];
  const answeredCount = Object.values(answers).filter((a) => a !== null).length;

  const clearSavedExam = () => {
    localStorage.removeItem(EXAM_DRAFT_STORAGE_KEY);
    localStorage.removeItem(EXAM_ENDS_AT_STORAGE_KEY);
  };

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
    clearSavedExam,
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
