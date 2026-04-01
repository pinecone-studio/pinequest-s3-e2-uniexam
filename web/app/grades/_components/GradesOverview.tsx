 "use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { graphqlRequest } from "@/lib/graphql";
import { isHiddenStudentExam } from "@/lib/exam-visibility";

type GradesCourse = {
  courseId: string;
  courseCode: string;
  courseName: string;
  currentGrade: number | null;
  exams: {
    id: string;
    name: string;
    score: number | null;
    maxScore: number;
    status: "reviewed" | "submitted" | "not_submitted";
  }[];
};

type GradesResponse = {
  studentByEmail: {
    id: string;
  } | null;
  enrollments: {
    id: string;
    student_id: string;
    course_id: string;
  }[];
  submissions: {
    id: string;
    student_id: string;
    exam_id: string;
    submitted_at: string | null;
    status: "in_progress" | "submitted" | "reviewed" | null;
    score_auto: number | null;
    score_manual: number | null;
    final_score: number | null;
    answers: {
      id: string;
      score: number | null;
    }[];
  }[];
  courses: {
    id: string;
    name: string | null;
    code: string | null;
    exams: {
      id: string;
      title: string | null;
    }[];
  }[];
};

type ExamQuestionsResponse = {
  examQuestions: {
    id: string;
    points: number | null;
  }[];
};

const GRADES_QUERY = `
  query GradesData($email: String!) {
    studentByEmail(email: $email) {
      id
    }
    enrollments {
      id
      student_id
      course_id
    }
    submissions {
      id
      student_id
      exam_id
      submitted_at
      status
      score_auto
      score_manual
      final_score
      answers {
        id
        score
      }
    }
    courses {
      id
      name
      code
      exams {
        id
        title
      }
    }
  }
`;

const EXAM_QUESTIONS_QUERY = `
  query GradeExamQuestions($examId: String!) {
    examQuestions(exam_id: $examId) {
      id
      points
    }
  }
`;

function getTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getLatestSubmissionPerExam(submissions: GradesResponse["submissions"]) {
  const latestByExam = new Map<string, GradesResponse["submissions"][number]>();

  [...submissions]
    .sort(
      (left, right) =>
        getTimestamp(right.submitted_at) - getTimestamp(left.submitted_at),
    )
    .forEach((submission) => {
      if (!submission.exam_id || latestByExam.has(submission.exam_id)) {
        return;
      }

      latestByExam.set(submission.exam_id, submission);
    });

  return latestByExam;
}

function buildCourseGrades(
  data: GradesResponse,
  studentId: string,
  examMaxScores: Map<string, number>,
) {
  const enrolledCourseIds = new Set(
    data.enrollments
      .filter((enrollment) => enrollment.student_id === studentId)
      .map((enrollment) => enrollment.course_id),
  );
  const submittedExamIds = new Set(
    data.submissions
      .filter(
        (submission) =>
          submission.student_id === studentId &&
          (submission.status === "submitted" || submission.status === "reviewed"),
      )
      .map((submission) => submission.exam_id),
  );
  const courseIdsFromSubmissions = new Set<string>();
  data.courses.forEach((course) => {
    (course.exams ?? []).forEach((exam) => {
      if (submittedExamIds.has(exam.id)) {
        courseIdsFromSubmissions.add(course.id);
      }
    });
  });
  const effectiveCourseIds = new Set([
    ...enrolledCourseIds,
    ...courseIdsFromSubmissions,
  ]);

  const latestSubmissionsByExam = getLatestSubmissionPerExam(
    data.submissions.filter(
      (submission) =>
        submission.student_id === studentId &&
        (submission.status === "submitted" || submission.status === "reviewed"),
    ),
  );

  return data.courses
    .filter((course) => effectiveCourseIds.has(course.id))
    .map<GradesCourse | null>((course) => {
      const exams = (course.exams ?? [])
        .filter((exam) => !isHiddenStudentExam(exam.title))
        .map<GradesCourse["exams"][number] | null>((exam) => {
          const latestSubmission = latestSubmissionsByExam.get(exam.id);

          if (!latestSubmission) {
            return null;
          }

          const answerScoreSum = (latestSubmission.answers ?? []).reduce(
            (sum, answer) =>
              typeof answer.score === "number" ? sum + answer.score : sum,
            0,
          );
          const finalScore =
            typeof latestSubmission?.final_score === "number"
              ? latestSubmission.final_score
              : null;
          const autoScore =
            typeof latestSubmission?.score_auto === "number"
              ? latestSubmission.score_auto
              : null;
          const manualScore =
            typeof latestSubmission?.score_manual === "number"
              ? latestSubmission.score_manual
              : null;
          const resolvedScore =
            finalScore ?? manualScore ?? autoScore ?? answerScoreSum;
          const hasResolvedScore = typeof resolvedScore === "number";

          return {
            id: exam.id,
            name: exam.title?.trim() || "Нэргүй шалгалт",
            score: hasResolvedScore ? resolvedScore : null,
            maxScore: examMaxScores.get(exam.id) ?? 0,
            status: hasResolvedScore
              ? "reviewed"
              : latestSubmission
                ? "submitted"
                : "not_submitted",
          };
        })
        .filter(
          (exam): exam is GradesCourse["exams"][number] => exam !== null,
        );

      if (exams.length === 0) {
        return null;
      }

      const reviewedExams = exams.filter(
        (exam) => exam.score !== null && exam.maxScore > 0,
      );
      const totalScore = reviewedExams.reduce(
        (sum, exam) => sum + (exam.score ?? 0),
        0,
      );
      const totalMaxScore = reviewedExams.reduce(
        (sum, exam) => sum + exam.maxScore,
        0,
      );

      return {
        courseId: course.id,
        courseCode: course.code?.trim() || "CODE",
        courseName: course.name?.trim() || "Нэргүй хичээл",
        currentGrade:
          totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : null,
        exams,
      };
    })
    .filter((course): course is GradesCourse => course !== null)
    .sort((left, right) => left.courseName.localeCompare(right.courseName));
}

export default function GradesOverview() {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState<GradesCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadGrades = async () => {
      try {
        setLoading(true);
        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          if (cancelled) return;
          setCourses([]);
          setLoading(false);
          return;
        }

        const data = await graphqlRequest<GradesResponse>(GRADES_QUERY, {
          email: studentEmail,
        });

        if (cancelled) return;

        const studentId = data.studentByEmail?.id;

        if (!studentId) {
          setCourses([]);
          return;
        }

        const enrolledCourseIds = new Set(
          data.enrollments
            .filter((enrollment) => enrollment.student_id === studentId)
            .map((enrollment) => enrollment.course_id),
        );
        const submittedExamIds = new Set(
          data.submissions
            .filter(
              (submission) =>
                submission.student_id === studentId &&
                (submission.status === "submitted" ||
                  submission.status === "reviewed"),
            )
            .map((submission) => submission.exam_id),
        );
        const courseIdsFromSubmissions = new Set<string>();
        data.courses.forEach((course) => {
          (course.exams ?? []).forEach((exam) => {
            if (submittedExamIds.has(exam.id)) {
              courseIdsFromSubmissions.add(course.id);
            }
          });
        });
        const effectiveCourseIds = new Set([
          ...enrolledCourseIds,
          ...courseIdsFromSubmissions,
        ]);

        const visibleExamIds = data.courses
          .filter((course) => effectiveCourseIds.has(course.id))
          .flatMap((course) => course.exams ?? [])
          .filter((exam) => !isHiddenStudentExam(exam.title))
          .map((exam) => exam.id);

        const examQuestionEntries = await Promise.all(
          visibleExamIds.map(async (examId) => {
            const response = await graphqlRequest<ExamQuestionsResponse>(
              EXAM_QUESTIONS_QUERY,
              { examId },
            );

            const maxScore = (response.examQuestions ?? []).reduce(
              (sum, question) => sum + (question.points ?? 0),
              0,
            );

            return [examId, maxScore] as const;
          }),
        );

        if (cancelled) return;

        const nextCourses = buildCourseGrades(
          data,
          studentId,
          new Map(examQuestionEntries),
        );

        setCourses(nextCourses);
      } catch {
        if (!cancelled) {
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadGrades();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

  const gradedCourses = courses.filter(
    (course) => typeof course.currentGrade === "number",
  );
  const averageGrade =
    gradedCourses.length > 0
      ? Math.round(
          gradedCourses.reduce(
            (acc, grade) => acc + (grade.currentGrade ?? 0),
            0,
          ) / gradedCourses.length,
        )
      : 0;
  const overallGPA =
    gradedCourses.length > 0 ? (averageGrade / 100) * 4 : 0;
  const totalCredits = courses.length;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Дүн</h1>
        <p className="text-muted-foreground">
          Бүх хичээл дээрх үзүүлэлтээ хянах
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-2 p-6">
          {/* <CardHeader className="flex flex-row items-center justify-between pb-2"> */}
          <CardTitle className="text-sm font-medium">GPA</CardTitle>
          {/* <Award className="h-4 w-4 text-primary" /> */}
          {/* </CardHeader> */}
          <CardContent className="p-0">
            {loading ? (
              <>
                <Skeleton className="h-9 w-[68px]" />
                <Skeleton className="mt-2 h-4 w-[42px]" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold">{overallGPA.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-2">4.0-аас</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="gap-2 p-6">
          {/* <CardHeader className="flex flex-row items-center justify-between pb-2"> */}
          <CardTitle className="text-sm font-medium">Кредит</CardTitle>
          {/* <BookOpen className="h-4 w-4 text-muted-foreground" /> */}
          {/* </CardHeader> */}
          <CardContent className="p-0">
            {loading ? (
              <>
                <Skeleton className="h-9 w-[32px]" />
                <Skeleton className="mt-2 h-4 w-[58px]" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold">{totalCredits}</div>
                <p className="text-xs text-muted-foreground mt-2">Энэ улирал</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="gap-2 p-6">
          {/* <CardHeader className="flex flex-row items-center justify-between pb-2"> */}
          <CardTitle className="text-sm font-medium">Дундаж дүн</CardTitle>
          {/* <BarChart3 className="h-4 w-4 text-muted-foreground" /> */}
          {/* </CardHeader> */}
          <CardContent className="p-0">
            {loading ? (
              <>
                <Skeleton className="h-9 w-[76px]" />
                <Skeleton className="mt-2 h-4 w-[74px]" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold">{averageGrade}%</div>
                <p className="text-xs text-muted-foreground mt-2">Бүх хичээлээр</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="gap-2 p-6">
          <CardHeader className="flex flex-row items-center justify-between px-0">
            <CardTitle className="text-sm font-medium">Үзүүлэлт</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <>
                <Skeleton className="h-9 w-[62px]" />
                <Skeleton className="mt-2 h-4 w-[88px]" />
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-[#42c66e]">+0.15</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Энэ сард GPA өссөн
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
