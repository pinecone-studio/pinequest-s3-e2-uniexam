"use client";

import { useUser } from "@clerk/nextjs";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createCheatLogEntry, updateCheatLogEntry } from "@/lib/cheat-logs";
import { getSocket } from "@/lib/socket";
import { resolveStudentId } from "@/lib/students";
import { useExamState } from "./use-exam-states";
import {
  getExamWarningSessionStorageKey,
  getExamWarningStateStorageKey,
} from "../exam-warning-storage";

export const EXAM_WARNING_CODES = {
  windowLeave: "window_leave",
  windowBlur: "window_blur",
  tabHidden: "tab_hidden",
  keyboardShortcut: "keyboard_shortcut",
  contextMenu: "context_menu",
  clipboardBlocked: "clipboard_blocked",
  proctorMultiplePeople: "proctor_multiple_people",
  proctorFaceMissing: "proctor_face_missing",
  proctorLookingDown: "proctor_looking_down",
  proctorPhoneVisible: "proctor_phone_visible",
  proctorUnavailable: "proctor_unavailable",
} as const;

export type ExamWarningCode =
  (typeof EXAM_WARNING_CODES)[keyof typeof EXAM_WARNING_CODES];

type WarningRecord = {
  count: number;
  logId?: string;
  lastRecordedAt: string;
};

type WarningState = Partial<Record<ExamWarningCode, WarningRecord>>;

type WarningDetails = {
  message?: string;
  severity?: "warning" | "danger";
};

type ExamWarningTrackerContextValue = {
  flushWarningLogs: () => Promise<void>;
  recordWarning: (code: ExamWarningCode, details?: WarningDetails) => void;
  warningCount: number;
};

const WARNING_LOG_TYPE = "exam_warning";
const DEFAULT_WARNING_MESSAGES: Record<ExamWarningCode, string> = {
  [EXAM_WARNING_CODES.windowLeave]: "Window focus was lost",
  [EXAM_WARNING_CODES.windowBlur]: "Window blurred during exam",
  [EXAM_WARNING_CODES.tabHidden]: "Student switched browser tab",
  [EXAM_WARNING_CODES.keyboardShortcut]: "Blocked keyboard shortcut attempt",
  [EXAM_WARNING_CODES.contextMenu]: "Right-click context menu attempt",
  [EXAM_WARNING_CODES.clipboardBlocked]: "Copy/paste attempt blocked",
  [EXAM_WARNING_CODES.proctorMultiplePeople]: "Multiple faces detected",
  [EXAM_WARNING_CODES.proctorFaceMissing]: "Face is not visible",
  [EXAM_WARNING_CODES.proctorLookingDown]: "Student looked away/down",
  [EXAM_WARNING_CODES.proctorPhoneVisible]: "Phone detected",
  [EXAM_WARNING_CODES.proctorUnavailable]: "Proctoring camera unavailable",
};

const ExamWarningTrackerContext =
  createContext<ExamWarningTrackerContextValue | null>(null);

const parseStoredWarningState = (value: string | null): WarningState => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as WarningState;
    return parsed ?? {};
  } catch {
    return {};
  }
};

const loadWarningState = (examId: string) => {
  if (typeof window === "undefined") {
    return {};
  }

  return parseStoredWarningState(
    localStorage.getItem(getExamWarningStateStorageKey(examId)),
  );
};

const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `warning-session-${Date.now()}`;
};

const getOrCreateSessionId = (examId: string) => {
  if (typeof window === "undefined") {
    return createSessionId();
  }

  const storageKey = getExamWarningSessionStorageKey(examId);
  const existing = localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const next = createSessionId();
  localStorage.setItem(storageKey, next);
  return next;
};

const getTotalWarningCount = (warningState: WarningState) =>
  Object.values(warningState).reduce(
    (sum, record) => sum + (record?.count ?? 0),
    0,
  );

export const ExamWarningTrackerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { exam } = useExamState();
  const { user, isLoaded } = useUser();
  const studentEmail = user?.primaryEmailAddress?.emailAddress;
  const studentName =
    user?.fullName || user?.username || studentEmail || "Student";
  const [studentId, setStudentId] = useState<string | null>(null);
  const [warningState, setWarningState] = useState<WarningState>(() =>
    loadWarningState(exam.id),
  );
  const warningStateRef = useRef<WarningState>(warningState);
  const sessionIdRef = useRef<string>(getOrCreateSessionId(exam.id));
  const syncedCountsRef = useRef<Partial<Record<ExamWarningCode, number>>>(
    Object.fromEntries(
      Object.entries(warningState).map(([code, record]) => [
        code,
        record?.logId ? record.count : 0,
      ]),
    ) as Partial<Record<ExamWarningCode, number>>,
  );
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    warningStateRef.current = warningState;

    localStorage.setItem(
      getExamWarningStateStorageKey(exam.id),
      JSON.stringify(warningState),
    );
  }, [exam.id, warningState]);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    if (!studentEmail) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          setStudentId(null);
        }
      });
      return;
    }

    const loadStudentId = async () => {
      try {
        const nextStudentId = await resolveStudentId(studentEmail, studentName);

        if (!cancelled) {
          setStudentId(nextStudentId);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to resolve student for warning tracker", error);
        }
      }
    };

    void loadStudentId();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    studentEmail,
    studentName,
  ]);

  const resolveTrackerStudentId = useCallback(async () => {
    if (studentId) {
      return studentId;
    }

    if (!isLoaded || !studentEmail) {
      return null;
    }

    const nextStudentId = await resolveStudentId(studentEmail, studentName);
    setStudentId(nextStudentId);
    return nextStudentId;
  }, [isLoaded, studentEmail, studentId, studentName]);

  const syncWarnings = useCallback(async () => {
    const trackerStudentId = await resolveTrackerStudentId();

    if (!trackerStudentId) {
      return;
    }

    const currentState = warningStateRef.current;
    const totalCount = getTotalWarningCount(currentState);

    for (const [code, record] of Object.entries(currentState) as [
      ExamWarningCode,
      WarningRecord | undefined,
    ][]) {
      if (!record || record.count <= 0) {
        continue;
      }

      const syncedCount = syncedCountsRef.current[code] ?? 0;

      if (record.count <= syncedCount && record.logId) {
        continue;
      }

      const metadata = JSON.stringify({
        count: record.count,
        latestAt: record.lastRecordedAt,
        sessionId: sessionIdRef.current,
        totalCount,
        warningCode: code,
      });

      if (record.logId) {
        await updateCheatLogEntry({
          id: record.logId,
          severity: record.count,
          metadata,
        });

        syncedCountsRef.current[code] = record.count;
        continue;
      }

      const createdLog = await createCheatLogEntry({
        studentId: trackerStudentId,
        examId: exam.id,
        type: WARNING_LOG_TYPE,
        event: code,
        severity: record.count,
        metadata,
      });

      syncedCountsRef.current[code] = record.count;

      setWarningState((prev) => {
        const currentRecord = prev[code];

        if (!currentRecord || currentRecord.logId === createdLog.id) {
          return prev;
        }

        return {
          ...prev,
          [code]: {
            ...currentRecord,
            logId: createdLog.id ?? undefined,
          },
        };
      });
    }
  }, [exam.id, resolveTrackerStudentId]);

  const flushWarningLogs = useCallback(async () => {
    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(syncWarnings);
    return syncQueueRef.current;
  }, [syncWarnings]);

  const recordWarning = useCallback(
    (code: ExamWarningCode, details?: WarningDetails) => {
      const timestamp = new Date().toISOString();

      setWarningState((prev) => {
        const current = prev[code];

        return {
          ...prev,
          [code]: {
            count: (current?.count ?? 0) + 1,
            logId: current?.logId,
            lastRecordedAt: timestamp,
          },
        };
      });

      const roomId = `exam-room-${exam.id}`;
      const socket = getSocket();
      socket.emit("warning-event", {
        roomId,
        warningCode: code,
        type: code,
        message: details?.message ?? DEFAULT_WARNING_MESSAGES[code],
        severity: details?.severity ?? "warning",
        createdAt: timestamp,
        studentId: studentId ?? undefined,
        studentName,
      });
    },
    [exam.id, studentId, studentName],
  );

  const warningCount = useMemo(
    () => getTotalWarningCount(warningState),
    [warningState],
  );

  const value = useMemo(
    () => ({
      flushWarningLogs,
      recordWarning,
      warningCount,
    }),
    [flushWarningLogs, recordWarning, warningCount],
  );

  return (
    <ExamWarningTrackerContext.Provider value={value}>
      {children}
    </ExamWarningTrackerContext.Provider>
  );
};

export const useExamWarningTracker = () => {
  const context = useContext(ExamWarningTrackerContext);

  if (!context) {
    throw new Error(
      "useExamWarningTracker must be used within ExamWarningTrackerProvider",
    );
  }

  return context;
};
