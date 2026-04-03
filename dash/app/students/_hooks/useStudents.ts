import { useEffect, useState } from "react";
import { Student } from "../type";
import { graphqlFetch } from "../lib/graphql-client";
import {
  GET_STUDENTS_REAL,
  GET_STUDENTS_REAL_LEGACY,
} from "../queries/student";

const EXAM_POINTS_QUERY = `
  query ExamPoints($examId: String!) {
    examQuestions(exam_id: $examId) {
      points
    }
  }
`;

type RealStudent = {
  id: string;
  name: string | null;
  email: string | null;
  major?: string | null;
  created_at?: string | null;
};

type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
};

type Course = {
  id: string;
  code: string | null;
};

type Exam = {
  id: string;
  title: string | null;
  course_id: string | null;
};

type Submission = {
  id: string;
  student_id: string;
  exam_id: string | null;
  status: "in_progress" | "submitted" | "reviewed" | null;
  final_score: number | null;
  submitted_at: string | null;
  started_at: string | null;
};

type CheatLog = {
  id: string;
  student_id: string | null;
  severity: number | null;
};

type StudentsRealResponse = {
  students: RealStudent[];
  enrollments: Enrollment[];
  courses: Course[];
  exams: Exam[];
  submissions: Submission[];
  cheatLogs: CheatLog[];
};

type ExamPointsResponse = {
  examQuestions: Array<{ points: number | null }> | null;
};

const DEFAULT_STUDENT: Omit<Student, "id" | "name" | "email"> = {
  course: "-",
  className: "-",
  examTitle: "-",
  finalScore: null,
  major: "-",
  violationCount: 0,
  averageScore: 0,
  examsTaken: 0,
  trend: "stable",
  lastActive: "-",
  examHistory: [],
};

function toCourseLabelFromCode(code: string | null | undefined): string {
  const safeCode = (code ?? "").trim();
  if (!safeCode) return "-";

  const digits = safeCode.match(/(\d{3})/)?.[1];
  const year = digits?.[0];

  if (year === "1") return "1-р курс";
  if (year === "2") return "2-р курс";
  if (year === "3") return "3-р курс";
  if (year === "4") return "4-р курс";

  return "-";
}

function toPercent(
  score: number | null | undefined,
  total: number | null | undefined,
): number | null {
  if (score === null || score === undefined) return null;

  const safeScore = Number(score);
  const safeTotal = Number(total ?? 0);

  if (!Number.isFinite(safeScore)) return null;
  if (safeTotal > 0) {
    return Math.round((safeScore / safeTotal) * 1000) / 10;
  }

  if (safeScore <= 1) {
    return Math.round(safeScore * 1000) / 10;
  }

  return Math.round(safeScore * 10) / 10;
}

function isVisibleSubmissionStatus(status: Submission["status"]): boolean {
  return status === "submitted" || status === "reviewed";
}

function mapToStudents(
  data: StudentsRealResponse,
  examTotalsById: Map<string, number>,
): Student[] {
  const students = data.students ?? [];
  const enrollments = data.enrollments ?? [];
  const courses = data.courses ?? [];
  const exams = data.exams ?? [];
  const submissions = data.submissions ?? [];
  const cheatLogs = data.cheatLogs ?? [];

  const courseById = new Map(courses.map((course) => [course.id, course]));
  const examById = new Map(exams.map((exam) => [exam.id, exam]));

  const enrollmentsByStudentId = new Map<string, string[]>();
  for (const enrollment of enrollments) {
    const next = enrollmentsByStudentId.get(enrollment.student_id) ?? [];
    next.push(enrollment.course_id);
    enrollmentsByStudentId.set(enrollment.student_id, next);
  }

  const violationByStudentId = new Map<string, number>();
  for (const log of cheatLogs) {
    if (!log.student_id) continue;
    const severity = Number(log.severity ?? 0);
    const current = violationByStudentId.get(log.student_id) ?? 0;
    violationByStudentId.set(
      log.student_id,
      current + (Number.isFinite(severity) ? severity : 0)
    );
  }

  const submissionsByStudentId = new Map<string, Submission[]>();
  for (const submission of submissions) {
    const next = submissionsByStudentId.get(submission.student_id) ?? [];
    next.push(submission);
    submissionsByStudentId.set(submission.student_id, next);
  }

  return students.map((student) => {
    const courseIds = enrollmentsByStudentId.get(student.id) ?? [];
    const classCode = courseById.get(courseIds[0] ?? "")?.code ?? "-";

    const studentSubmissions = (submissionsByStudentId.get(student.id) ?? []).filter(
      (submission) => isVisibleSubmissionStatus(submission.status),
    );
    const examsForStudent = exams.filter(
      (exam) => exam.course_id && courseIds.includes(exam.course_id)
    );

    const sortedSubmissions = [...studentSubmissions].sort((a, b) => {
      const aTime = new Date(a.submitted_at ?? a.started_at ?? 0).getTime();
      const bTime = new Date(b.submitted_at ?? b.started_at ?? 0).getTime();
      return bTime - aTime;
    });

    const latestSubmission = sortedSubmissions[0] ?? null;

    const examHistory = sortedSubmissions.map((s) => {
      const percentScore = toPercent(
        s.final_score,
        s.exam_id ? (examTotalsById.get(s.exam_id) ?? 0) : 0,
      );
      return {
        id: s.id,
        name: examById.get(s.exam_id ?? "")?.title ?? "Unknown Exam",
        date: s.submitted_at || s.started_at || "-",
        score: percentScore,
        maxScore: 100,
        grade: "-",
      };
    });

    const scaledFinalScore = toPercent(
      latestSubmission?.final_score ?? null,
      latestSubmission?.exam_id
        ? (examTotalsById.get(latestSubmission.exam_id) ?? 0)
        : 0,
    );

    return {
      id: student.id,
      name: student.name ?? "-",
      email: student.email ?? "-",
      ...DEFAULT_STUDENT,
      className: classCode,
      course: toCourseLabelFromCode(classCode),
      major: student.major ?? "-",
      violationCount: violationByStudentId.get(student.id) ?? 0,
      examTitle: latestSubmission 
          ? (examById.get(latestSubmission.exam_id ?? "")?.title ?? "Unknown Exam")
          : (examsForStudent[0]?.title ?? "-"),
      finalScore: scaledFinalScore,
      examsTaken: studentSubmissions.length,
      lastActive: latestSubmission?.submitted_at ?? student.created_at ?? "-",
      examHistory,
    };
  });
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await graphqlFetch<StudentsRealResponse>(GET_STUDENTS_REAL);
        if (!isMounted) return;
        const examIds = Array.from(
          new Set(
            (data.submissions ?? [])
              .map((submission) => submission.exam_id)
              .filter((examId): examId is string => Boolean(examId)),
          ),
        );

        const examTotals = await Promise.all(
          examIds.map(async (examId) => {
            const pointsData = await graphqlFetch<ExamPointsResponse>(
              EXAM_POINTS_QUERY,
              { examId },
            );
            const total = (pointsData.examQuestions ?? []).reduce(
              (sum, row) => sum + (row.points ?? 0),
              0,
            );
            return [examId, total] as const;
          }),
        );

        if (!isMounted) return;
        setStudents(mapToStudents(data, new Map(examTotals)));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const majorFieldMissing = message.includes('Cannot query field "major"');

        if (!majorFieldMissing) {
          if (!isMounted) return;
          setError(message);
          return;
        }

        try {
          const legacyData = await graphqlFetch<StudentsRealResponse>(
            GET_STUDENTS_REAL_LEGACY
          );
          if (!isMounted) return;
          const examIds = Array.from(
            new Set(
              (legacyData.submissions ?? [])
                .map((submission) => submission.exam_id)
                .filter((examId): examId is string => Boolean(examId)),
            ),
          );

          const examTotals = await Promise.all(
            examIds.map(async (examId) => {
              const pointsData = await graphqlFetch<ExamPointsResponse>(
                EXAM_POINTS_QUERY,
                { examId },
              );
              const total = (pointsData.examQuestions ?? []).reduce(
                (sum, row) => sum + (row.points ?? 0),
                0,
              );
              return [examId, total] as const;
            }),
          );

          if (!isMounted) return;
          setStudents(mapToStudents(legacyData, new Map(examTotals)));
        } catch (legacyErr: unknown) {
          if (!isMounted) return;
          setError(legacyErr instanceof Error ? legacyErr.message : "Unknown error");
        }
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { students, loading, error };
}
