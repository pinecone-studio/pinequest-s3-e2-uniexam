import { useEffect, useState } from "react";
import { Student } from "../type";
import { graphqlFetch } from "../lib/graphql-client";
import {
  GET_STUDENTS_REAL,
  GET_STUDENTS_REAL_LEGACY,
} from "../queries/student";

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

function mapToStudents(data: StudentsRealResponse): Student[] {
  const students = data.students ?? [];
  const enrollments = data.enrollments ?? [];
  const courses = data.courses ?? [];
  const exams = data.exams ?? [];
  const submissions = data.submissions ?? [];
  const cheatLogs = data.cheatLogs ?? [];

  const courseById = new Map(courses.map((course) => [course.id, course]));

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

    const examsForStudent = exams.filter(
      (exam) => exam.course_id && courseIds.includes(exam.course_id)
    );
    const latestSubmission =
      submissionsByStudentId
        .get(student.id)
        ?.sort((a, b) => {
          const aTime = new Date(a.submitted_at ?? a.started_at ?? 0).getTime();
          const bTime = new Date(b.submitted_at ?? b.started_at ?? 0).getTime();
          return bTime - aTime;
        })[0] ?? null;

    return {
      id: student.id,
      name: student.name ?? "-",
      email: student.email ?? "-",
      ...DEFAULT_STUDENT,
      className: classCode,
      course: toCourseLabelFromCode(classCode),
      major: student.major ?? "-",
      violationCount: violationByStudentId.get(student.id) ?? 0,
      examTitle: examsForStudent[0]?.title ?? "-",
      finalScore: latestSubmission?.final_score ?? null,
      examsTaken: examsForStudent.length,
      lastActive: student.created_at ?? "-",
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
        setStudents(mapToStudents(data));
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
          setStudents(mapToStudents(legacyData));
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
