export type PracticeMode = "exam" | "topic";

export type PracticeDifficulty = "easy" | "medium" | "hard";

export type PracticeExamSummary = {
  id: string;
  title: string;
  courseName: string;
  courseCode: string;
  startTime: string | null;
};

export type PracticeSession = {
  examId: string | null;
  startedAt: string;
  currentQuestion: number;
  answers: (number | null)[];
  showResults: boolean;
};

export type PracticeHistoryEntry = {
  id: string;
  title: string;
  subject?: string;
  submittedAt: string;
  durationSeconds: number;
  score: number;
  totalQuestions: number;
  details: {
    id: string;
    orderIndex: number;
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
};

export type PracticeQuestion = {
  topic: string;
  difficulty: PracticeDifficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};
