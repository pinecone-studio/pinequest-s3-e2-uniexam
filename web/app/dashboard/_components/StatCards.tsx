"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, Clock, FileCheck2, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isHiddenStudentExam } from "@/lib/exam-visibility";
import { graphqlRequest } from "@/lib/graphql";

type DashboardStatsResponse = {
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
    final_score: number | null;
    answers: {
      id: string;
    }[];
  }[];
  courses: {
    id: string;
    exams: {
      id: string;
      title?: string;
      start_time: string;
    }[];
  }[];
};

type StatsState = {
  enrolledCoursesCount: number;
  upcomingExamsCount: number;
  completedExamsCount: number;
  totalAnswersCount: number;
  averageScore: number | null;
  reviewedCount: number;
  nextExamAt: string | null;
};

type StatItem = {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
};

const DASHBOARD_STATS_QUERY = `
  query DashboardStats($email: String!) {
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
      final_score
      answers {
        id
      }
    }
    courses {
      id
      exams {
        id
        title
        start_time
      }
    }
  }
`;

const EMPTY_STATS: StatsState = {
  enrolledCoursesCount: 0,
  upcomingExamsCount: 0,
  completedExamsCount: 0,
  totalAnswersCount: 0,
  averageScore: null,
  reviewedCount: 0,
  nextExamAt: null,
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const getTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getLatestSubmissionPerExam = (
  submissions: DashboardStatsResponse["submissions"],
) => {
  const latestByExam = new Map<
    string,
    DashboardStatsResponse["submissions"][number]
  >();

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

  return [...latestByExam.values()];
};

const getAverageScoreSummary = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  if (value >= 90) {
    return "Маш сайн";
  }

  if (value >= 80) {
    return "Сайн";
  }

  if (value >= 70) {
    return "Хэвийн";
  }

  if (value >= 60) {
    return "Анхаарах хэрэгтэй";
  }

  return "Сайжруулах хэрэгтэй";
};

const buildStats = (
  data: DashboardStatsResponse,
  studentId: string,
): StatsState => {
  const enrolledCourseIds = new Set(
    data.enrollments
      .filter((enrollment) => enrollment.student_id === studentId)
      .map((enrollment) => enrollment.course_id),
  );

  const enrolledCourses = data.courses.filter((course) =>
    enrolledCourseIds.has(course.id),
  );

  const studentSubmissions = data.submissions.filter(
    (submission) => submission.student_id === studentId,
  );

  const completedSubmissions = getLatestSubmissionPerExam(
    studentSubmissions.filter(
      (submission) =>
        submission.status === "submitted" || submission.status === "reviewed",
    ),
  );

  const completedExamIds = new Set(
    completedSubmissions.map((submission) => submission.exam_id),
  );

  const upcomingExams = enrolledCourses
    .flatMap((course) => course.exams ?? [])
    .filter((exam) => {
      const startsAt = getTimestamp(exam.start_time);
      return (
        startsAt >= Date.now() &&
        !completedExamIds.has(exam.id) &&
        !isHiddenStudentExam(exam.title)
      );
    })
    .sort(
      (left, right) =>
        getTimestamp(left.start_time) - getTimestamp(right.start_time),
    );

  const reviewedSubmissions = completedSubmissions.filter(
    (submission) =>
      submission.status === "reviewed" &&
      typeof submission.final_score === "number",
  );

  const averageScore = reviewedSubmissions.length
    ? Math.round(
        reviewedSubmissions.reduce(
          (sum, submission) => sum + (submission.final_score ?? 0),
          0,
        ) / reviewedSubmissions.length,
      )
    : null;

  return {
    enrolledCoursesCount: enrolledCourses.length,
    upcomingExamsCount: upcomingExams.length,
    completedExamsCount: completedSubmissions.length,
    totalAnswersCount: completedSubmissions.reduce(
      (sum, submission) => sum + (submission.answers?.length ?? 0),
      0,
    ),
    averageScore,
    reviewedCount: reviewedSubmissions.length,
    nextExamAt: upcomingExams[0]?.start_time ?? null,
  };
};

export function StatCards() {
  const [stats, setStats] = useState<StatsState>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          if (cancelled) return;

          setStats(EMPTY_STATS);
          setMessage("Статистик харахын тулд нэвтэрнэ үү.");
          setLoading(false);
          return;
        }

        const data = await graphqlRequest<DashboardStatsResponse>(
          DASHBOARD_STATS_QUERY,
          {
            email: studentEmail,
          },
        );

        if (cancelled) return;

        const studentId = data.studentByEmail?.id;

        if (!studentId) {
          setStats(EMPTY_STATS);
          setMessage("Одоогоор таны оюутны мэдээлэл олдсонгүй.");
          return;
        }

        setStats(buildStats(data, studentId));
        setMessage(null);
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Статистик дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

  const averageScoreSummary = getAverageScoreSummary(stats.averageScore);

  const statItems: StatItem[] = [
    {
      label: "Бүртгэлтэй хичээл",
      value: String(stats.enrolledCoursesCount),
      sub:
        stats.enrolledCoursesCount > 0
          ? `${stats.upcomingExamsCount} ойрын шалгалттай`
          : "Бүртгэлтэй хичээл алга",
      icon: <BookOpen className="w-4 h-4 text-slate-400" />,
    },
    {
      label: "Өгөх шалгалт",
      value: String(stats.upcomingExamsCount),
      sub: stats.nextExamAt
        ? `Дараагийнх: ${formatDateTime(stats.nextExamAt)}`
        : "Товлогдсон шалгалт алга",
      icon: <Clock className="w-4 h-4 text-slate-400" />,
    },
    {
      label: "Өгсөн шалгалт",
      value: String(stats.completedExamsCount),
      sub:
        stats.completedExamsCount > 0
          ? `${stats.totalAnswersCount} хариулт илгээсэн`
          : "Илгээсэн шалгалт алга",
      icon: <FileCheck2 className="w-4 h-4 text-slate-400" />,
    },
    {
      label: "Дундаж үнэлгээ",
      value:
        stats.averageScore !== null
          ? `${stats.averageScore} оноо`
          : "Хүлээгдэж байна...",
      sub:
        stats.reviewedCount > 0
          ? averageScoreSummary
            ? `${averageScoreSummary} · ${stats.reviewedCount} шалгалт үнэлэгдсэн`
            : `${stats.reviewedCount} шалгалт үнэлэгдсэн`
          : "Шалгасан үнэлгээ хараахан алга",
      icon: <Target className="w-4 h-4 text-slate-400" />,
    },
  ];

  return (
    <div className="pt-4">
      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card
              key={`stat-skeleton-${index + 1}`}
              className="overflow-hidden rounded-xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5"
            >
              <CardContent className="flex h-full flex-col justify-between">
                <div className="mb-0.5 flex items-center justify-between">
                  <Skeleton className="h-3 w-20 bg-slate-200" />
                  <Skeleton className="h-4 w-4 rounded-full bg-slate-200" />
                </div>

                <div>
                  <Skeleton className="h-6 w-16 bg-slate-200" />
                  <Skeleton className="mt-2 h-3 w-28 bg-slate-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statItems.map((stat) => (
              <Card
                key={stat.label}
                className="overflow-hidden rounded-xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5"
              >
                <CardContent className="flex h-full flex-col justify-between">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {stat.label}
                    </span>
                    <span className="opacity-80">{stat.icon}</span>
                  </div>

                  <div>
                    <div className="py-1 text-lg font-bold leading-none text-slate-900">
                      {stat.value}
                    </div>

                    <div className="mt-2 text-[10px] font-medium leading-tight text-slate-400">
                      {stat.sub}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {message ? (
            <p className="mt-3 text-xs text-slate-500">{message}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
