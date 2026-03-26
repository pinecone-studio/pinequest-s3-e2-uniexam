export interface ExamHistory {
  id: number;
  name: string;
  date: string;
  score: number;
  maxScore: number;
  grade: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  averageScore: number;
  examsTaken: number;
  trend: "up" | "down" | "stable";
  lastActive: string;
  examHistory: ExamHistory[];
}