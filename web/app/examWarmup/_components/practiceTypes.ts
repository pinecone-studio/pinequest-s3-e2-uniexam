import { practiceQuestions } from "@/lib/data";

export type PracticeMode = "exam" | "topic";

export type PracticeSession = {
  examId: string;
  currentQuestion: number;
  answers: (number | null)[];
  showResults: boolean;
};

export type PracticeQuestion = (typeof practiceQuestions)[number];
