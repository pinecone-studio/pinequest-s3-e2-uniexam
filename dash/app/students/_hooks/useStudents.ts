import { useEffect, useState } from "react";
import { Student } from "../type";
import { graphqlFetch } from "../lib/graphql-client";
import {
  GET_STUDENTS,
  GET_STUDENTS_LEGACY,
  GET_STUDENTS_MINIMAL,
} from "../queries/student";

type GetStudentsResponse = {
  students: Student[];
};

type StudentLegacy = Omit<Student, "className">;
type GetStudentsLegacyResponse = {
  students: StudentLegacy[];
};

type StudentMinimal = {
  id: string;
  name: string;
  email: string;
  created_at?: string | null;
};

type GetStudentsMinimalResponse = {
  students: StudentMinimal[];
};

const toSafeStudent = (student: Partial<Student>): Student => ({
  id: student.id ?? "",
  name: student.name ?? "-",
  email: student.email ?? "-",
  course: student.course ?? "-",
  className: student.className ?? "-",
  major: student.major ?? "-",
  averageScore: student.averageScore ?? 0,
  examsTaken: student.examsTaken ?? 0,
  trend: student.trend ?? "stable",
  lastActive: student.lastActive ?? "-",
  examHistory: student.examHistory ?? [],
});

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      try {
        const data = await graphqlFetch<GetStudentsResponse>(GET_STUDENTS);
        if (!isMounted) return;
        setStudents(data.students.map(toSafeStudent));
      } catch (fullErr: unknown) {
        const fullMessage =
          fullErr instanceof Error ? fullErr.message : "Unknown error";

        try {
          const legacyData = await graphqlFetch<GetStudentsLegacyResponse>(
            GET_STUDENTS_LEGACY
          );
          if (!isMounted) return;
          setStudents(
            legacyData.students.map((student) =>
              toSafeStudent({ ...student, className: "-" })
            )
          );
        } catch {
          try {
            const minimalData = await graphqlFetch<GetStudentsMinimalResponse>(
              GET_STUDENTS_MINIMAL
            );
            if (!isMounted) return;
            setStudents(
              minimalData.students.map((student) =>
                toSafeStudent({
                  id: student.id,
                  name: student.name,
                  email: student.email,
                  lastActive: student.created_at ?? "-",
                })
              )
            );
          } catch (minimalErr: unknown) {
            if (!isMounted) return;
            setError(
              minimalErr instanceof Error ? minimalErr.message : fullMessage
            );
          }
        }
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    void loadStudents();

    return () => {
      isMounted = false;
    };
  }, []);

  return { students, loading, error };
}
