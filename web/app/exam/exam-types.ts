export type ExamChoice = {
  id: string;
  label: string;
  answerId?: string;
};

export type ExamQuestion = {
  id: number;
  questionId: string;
  question: string;
  imageUrl?: string | null;
  type: "Short Answer" | "Multiple Choice" | "True/False";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  choices?: ExamChoice[];
  correctAnswer: string;
};

export type ExamMeta = {
  id: string;
  title: string;
  subtitle?: string;
  durationSeconds: number;
  startTime?: string | null;
  endTime?: string | null;
};
