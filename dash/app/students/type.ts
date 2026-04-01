export interface ExamHistory {
  id: string;
  student_id?: string | null;
  name: string | null;
  date: string | null;
  score: number | null;
  maxScore: number | null;
  grade: string | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  className: string;
  examTitle: string;
  finalScore: number | null;
  major: string;
  violationCount: number;
  averageScore: number;
  examsTaken: number;
  trend: "up" | "down" | "stable" | string;
  lastActive: string;
  examHistory: ExamHistory[];
}
