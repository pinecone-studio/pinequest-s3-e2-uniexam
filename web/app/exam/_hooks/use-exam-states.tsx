"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ExamMeta, ExamQuestion } from "../exam-types";
import { getScheduledEndsAtMs } from "../exam-schedule";
import {
  getExamWarningSessionStorageKey,
  getExamWarningStateStorageKey,
} from "../exam-warning-storage";

type SavedExamState = {
  currentId: number;
  answers: Record<number, string | null>;
  flagged: number[];
};

export type ExamSessionStatus =
  | "active"
  | "auto_submitting"
  | "manual_submitting"
  | "submitted";

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
  const examId = exam.id;
  const durationSeconds = exam.durationSeconds;
  const startTime = exam.startTime;
  const endTime = exam.endTime;
  const initialState = getInitialExamState(examId);
  const [currentId, setCurrentId] = useState<number>(initialState.currentId);
  const [answers, setAnswers] = useState<Record<number, string | null>>(
    initialState.answers,
  );
  const [flagged, setFlagged] = useState<number[]>(initialState.flagged);
  const [sessionStatus, setSessionStatus] =
    useState<ExamSessionStatus>("active");

  useEffect(() => {
    const endsAtStorageKey = getExamEndsAtStorageKey(examId);
    const savedEndsAt = localStorage.getItem(endsAtStorageKey);
    const scheduledEndsAtMs = getScheduledEndsAtMs({
      durationSeconds,
      startTime,
      endTime,
    });

    if (scheduledEndsAtMs !== null) {
      if (savedEndsAt !== scheduledEndsAtMs.toString()) {
        localStorage.setItem(endsAtStorageKey, scheduledEndsAtMs.toString());
      }

      return;
    }

    if (!savedEndsAt) {
      const endsAt = Date.now() + durationSeconds * 1000;
      localStorage.setItem(endsAtStorageKey, endsAt.toString());
    }
  }, [durationSeconds, endTime, examId, startTime]);

  useEffect(() => {
    const payload: SavedExamState = {
      currentId,
      answers,
      flagged,
    };

    localStorage.setItem(
      getExamDraftStorageKey(examId),
      JSON.stringify(payload),
    );
  }, [answers, currentId, examId, flagged]);

  const totalQuestions = questions.length;
  const safeCurrentId =
    totalQuestions === 0 ? 1 : Math.min(Math.max(currentId, 1), totalQuestions);
  const currentQuestion = questions[safeCurrentId - 1] ?? questions[0];
  const answeredCount = Object.values(answers).filter((a) => a !== null).length;

  const clearSavedExam = () => {
    localStorage.removeItem(getExamDraftStorageKey(examId));
    localStorage.removeItem(getExamEndsAtStorageKey(examId));
    localStorage.removeItem(getExamWarningSessionStorageKey(examId));
    localStorage.removeItem(getExamWarningStateStorageKey(examId));
  };

  return {
    exam,
    questions,
    currentId: safeCurrentId,
    answers,
    flagged,
    totalQuestions,
    currentQuestion,
    answeredCount,
    sessionStatus,
    setCurrentId,
    setAnswers,
    setFlagged,
    setSessionStatus,
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
