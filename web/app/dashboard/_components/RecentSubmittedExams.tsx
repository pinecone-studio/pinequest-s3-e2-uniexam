"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, FileCheck2 } from "lucide-react";
import { CompletedExamDetailDialog } from "@/app/_components/CompletedExamDetailDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { graphqlRequest } from "@/lib/graphql";

type RecentSubmittedExamsResponse = {
  studentByEmail: {
    id: string;
  } | null;
  submissions: {
    id: string;
    student_id: string;
    exam_id: string;
    submitted_at: string | null;
    status: "in_progress" | "submitted" | "reviewed" | null;
    answers: {
      id: string;
    }[];
  }[];
  exams: {
    id: string;
    title: string;
    course: {
      name: string;
      code: string;
    } | null;
  }[];
};

type RecentSubmissionCard = {
  id: string;
  examId: string;
  title: string;
  subject: string;
  submittedAt: string;
  answeredCount: number;
  totalQuestions: number;
  status: "submitted" | "reviewed";
};

type ExamQuestionsCountResponse = {
  examQuestions: {
    id: string;
  }[];
};

const RECENT_SUBMISSIONS_LIMIT = 3;

const RECENT_SUBMITTED_EXAMS_QUERY = `
  query RecentSubmittedExams($email: String!) {
    studentByEmail(email: $email) {
      id
    }
    submissions {
      id
      student_id
      exam_id
      submitted_at
      status
      answers {
        id
      }
    }
    exams {
      id
      title
      course {
        name
        code
      }
    }
  }
`;

const EXAM_QUESTIONS_COUNT_QUERY = `
  query ExamQuestionsCount($examId: String!) {
    examQuestions(exam_id: $examId) {
      id
    }
  }
`;

const formatSubmittedAt = (value: string) => {
  const submittedAt = new Date(value);

  if (Number.isNaN(submittedAt.getTime())) {
    return "Огноо тодорхойгүй";
  }

  const date = new Intl.DateTimeFormat("mn-MN", {
    month: "2-digit",
    day: "2-digit",
  }).format(submittedAt);

  return date;
};

const getStatusLabel = (status: RecentSubmissionCard["status"]) =>
  status === "reviewed" ? "Шалгасан" : "Илгээсэн";

const buildRecentSubmissions = (
  submissions: RecentSubmittedExamsResponse["submissions"],
  exams: RecentSubmittedExamsResponse["exams"],
  examQuestionCountByExamId: Map<string, number>,
) => {
  const examsById = new Map(exams.map((exam) => [exam.id, exam]));

  return submissions
    .map<RecentSubmissionCard | null>((submission) => {
      const exam = examsById.get(submission.exam_id);

      if (!exam) {
        return null;
      }

      return {
        id: submission.id,
        examId: submission.exam_id,
        title: exam.title,
        subject: exam.course?.name ?? exam.course?.code ?? "Хичээл тодорхойгүй",
        submittedAt: submission.submitted_at as string,
        answeredCount: submission.answers?.length ?? 0,
        totalQuestions: examQuestionCountByExamId.get(submission.exam_id) ?? 0,
        status: submission.status as "submitted" | "reviewed",
      };
    })
    .filter((item): item is RecentSubmissionCard => item !== null)
};

export function RecentSubmittedExams() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [items, setItems] = useState<RecentSubmissionCard[]>([]);
  const [selectedExam, setSelectedExam] = useState<RecentSubmissionCard | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadRecentSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          if (cancelled) return;

          setItems([]);
          setMessage("Өгсөн шалгалтуудаа харахын тулд нэвтэрнэ үү.");
          setLoading(false);
          return;
        }

        const response = await graphqlRequest<RecentSubmittedExamsResponse>(
          RECENT_SUBMITTED_EXAMS_QUERY,
          { email: studentEmail },
        );

        if (cancelled) return;

        const studentId = response.studentByEmail?.id;

        if (!studentId) {
          setItems([]);
          setMessage("Таны оюутны мэдээлэл олдсонгүй.");
          return;
        }

        const recentSubmissions = response.submissions
          .filter(
            (submission) =>
              submission.student_id === studentId &&
              submission.submitted_at &&
              (submission.status === "submitted" ||
                submission.status === "reviewed"),
          )
          .sort(
            (left, right) =>
              new Date(right.submitted_at ?? "").getTime() -
              new Date(left.submitted_at ?? "").getTime(),
          )
          .slice(0, RECENT_SUBMISSIONS_LIMIT);

        const examQuestionCounts = await Promise.all(
          Array.from(new Set(recentSubmissions.map((item) => item.exam_id))).map(
            async (examId) => {
              const examQuestionsData =
                await graphqlRequest<ExamQuestionsCountResponse>(
                  EXAM_QUESTIONS_COUNT_QUERY,
                  { examId },
                );

              return [
                examId,
                examQuestionsData.examQuestions?.length ?? 0,
              ] as const;
            },
          ),
        );

        if (cancelled) return;

        const nextItems = buildRecentSubmissions(
          recentSubmissions,
          response.exams,
          new Map(examQuestionCounts),
        );

        setItems(nextItems);
        setMessage(
          nextItems.length === 0 ? "Одоогоор өгсөн шалгалт алга." : null,
        );
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Өгсөн шалгалтын мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRecentSubmissions();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress]);

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Ойрын өгсөн шалгалтууд
          </h2>
          <p className=" pt-1 text-[13px] font-medium text-slate-400">
            Сүүлийн өгсөн шалгалтууд болон тэдгээрийн мэдээлэл.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/exams#submitted-exams")}
          className="shrink-0 px-2 py-0.5 text-[11px]"
        >
          Бүгдийг харах <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="w-full space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card
              key={`recent-submission-skeleton-${index + 1}`}
              className="overflow-hidden rounded-2xl border-white/40 bg-white/60 ring-1 shadow-none ring-black/5"
            >
              <CardContent className="px-3 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-slate-200" />
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-2.5 w-24 bg-slate-200" />
                        <Skeleton className="h-2.5 w-10 bg-slate-200" />
                      </div>
                      <Skeleton className="h-4 w-44 bg-slate-200" />
                    </div>
                  </div>

                  <Skeleton className="h-6 w-16 shrink-0 rounded-full bg-slate-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          {message}
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="w-full space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedExam(item);
                setIsDialogOpen(true);
              }}
              className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006d77]/30"
            >
              <Card className="overflow-hidden rounded-2xl border-white/40 bg-white/60 ring-1 shadow-none ring-black/5 transition-colors hover:bg-[#f7fbfa] hover:ring-[#bfe3dd]">
                <CardContent className="px-3 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f9f8] text-[#006d77]">
                        <FileCheck2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium text-[#006d77]/70">
                            {item.subject}
                          </span>
                          <span className="mb-0.5 text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-[12px] font-medium leading-none text-slate-500">
                            <CalendarDays className="h-3 w-3" />
                            {formatSubmittedAt(item.submittedAt)}
                          </span>
                        </div>

                        <h3 className="mt-0.5 text-[14px] font-semibold leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div className="rounded-full bg-[#e6f4f1] px-2.5 py-1 text-[12px] font-semibold text-[#006d77]">
                        {getStatusLabel(item.status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      ) : null}

      <CompletedExamDetailDialog
        open={isDialogOpen}
        exam={selectedExam}
        onOpenChange={(open) => {
          setIsDialogOpen(open);

          if (!open) {
            setSelectedExam(null);
          }
        }}
      />
    </section>
  );
}
