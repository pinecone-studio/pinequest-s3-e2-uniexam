import type {
  PracticeHistoryEntry,
  PracticeQuestion,
} from "@/app/examWarmup/_components/practiceTypes";

const STORAGE_KEY = "exam-warmup-history";

const isBrowser = () => typeof window !== "undefined";

const normalizePracticeHistoryEntry = (
  item: Partial<PracticeHistoryEntry> | null | undefined,
): PracticeHistoryEntry | null => {
  if (!item || typeof item !== "object" || !item.id || !item.title) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    subject: item.subject,
    submittedAt: item.submittedAt ?? new Date(0).toISOString(),
    durationSeconds:
      typeof item.durationSeconds === "number" &&
      Number.isFinite(item.durationSeconds)
        ? item.durationSeconds
        : 0,
    score:
      typeof item.score === "number" && Number.isFinite(item.score)
        ? item.score
        : 0,
    totalQuestions:
      typeof item.totalQuestions === "number" && Number.isFinite(item.totalQuestions)
        ? item.totalQuestions
        : 0,
    details: Array.isArray(item.details) ? item.details : [],
  };
};

export const loadPracticeHistory = (): PracticeHistoryEntry[] => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as PracticeHistoryEntry[];

    return Array.isArray(parsed)
      ? parsed
          .map((item) => normalizePracticeHistoryEntry(item))
          .filter((item): item is PracticeHistoryEntry => item !== null)
      : [];
  } catch {
    return [];
  }
};

export const savePracticeHistory = (items: PracticeHistoryEntry[]) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const createPracticeHistoryItem = ({
  title,
  subject,
  questions,
  answers,
  startedAt,
}: {
  title: string;
  subject?: string;
  questions: PracticeQuestion[];
  answers: (number | null)[];
  startedAt?: string;
}): PracticeHistoryEntry => {
  const submittedAt = new Date().toISOString();
  const startedAtMs = startedAt ? new Date(startedAt).getTime() : Number.NaN;
  const submittedAtMs = new Date(submittedAt).getTime();
  const durationSeconds =
    Number.isFinite(startedAtMs) && Number.isFinite(submittedAtMs)
      ? Math.max(0, Math.round((submittedAtMs - startedAtMs) / 1000))
      : 0;
  const details = questions.map((question, index) => {
    const selectedIndex = answers[index];
    const studentAnswer =
      selectedIndex !== null && selectedIndex !== undefined
        ? question.options[selectedIndex] ?? "Хариулаагүй"
        : "Хариулаагүй";
    const correctAnswer =
      question.options[question.correctAnswer] ?? "Зөв хариулт олдсонгүй";

    return {
      id: `${submittedAt}-${index + 1}`,
      orderIndex: index + 1,
      question: question.question,
      studentAnswer,
      correctAnswer,
      isCorrect: selectedIndex === question.correctAnswer,
      explanation: question.explanation,
    };
  });

  return {
    id: `${submittedAt}-${Math.random().toString(36).slice(2, 10)}`,
    title,
    subject,
    submittedAt,
    durationSeconds,
    score: details.filter((item) => item.isCorrect).length,
    totalQuestions: details.length,
    details,
  };
};
