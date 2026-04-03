"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  RubricCriterion,
  type ClassCourse,
  type Student,
} from "@/lib/grading/types";
import { toast } from "sonner";

import {
  fetchStudentGradingContext,
  publishSubmissionGrade,
  saveEssayReviews,
} from "../../mockData";

import { EssaySubmission } from "./_components/EssaySubmission";
import { GradingHeader } from "./_components/GradingHeader";
import { GradingSidebar } from "./_components/GradingSidebar";
import { StudentInfoHeader } from "./_components/StudentInfoHeader";
import { Skeleton } from "@/components/ui/skeleton";

const GradeStudentPageSkeleton = () => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-4 w-36" />
      </header>

      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 p-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        <aside className="w-80 border-l border-gray-200 bg-white p-4">
          <div className="space-y-4">
            <div className="space-y-2 rounded-2xl border border-[#31A8E0]/25 bg-[#31A8E0]/5 px-5 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="space-y-2 rounded-2xl border border-gray-200 bg-white px-5 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2 rounded-2xl border border-gray-200 bg-white px-5 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
};

const GradeStudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const studentId = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ClassCourse | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [essayIndex, setEssayIndex] = useState(0);

  const [essayStates, setEssayStates] = useState<
    { rubric: RubricCriterion[]; feedback: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchStudentGradingContext(classId, studentId);
        if (cancelled) return;

        setCourse(res.course);
        setAllStudents(res.classStudents);
        setStudent(res.student);
        setSubmissionId(res.submissionId);
        setEssayIndex(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [classId, studentId]);

  useEffect(() => {
    if (!student) {
      setEssayStates([]);
      return;
    }

    setEssayStates(
      student.essays.map((e) => ({
        rubric: e.rubric.map((r) => ({ ...r })),
        feedback: e.feedback,
      })),
    );
  }, [student]);

  const studentIndex = allStudents.findIndex((s) => s.id === studentId);

  const currentEssay = useMemo(() => {
    if (!student || student.essays.length === 0) return null;

    const base = student.essays[essayIndex];
    const state = essayStates[essayIndex];

    return {
      ...base,
      rubric: state?.rubric ?? base.rubric,
      feedback: state?.feedback ?? base.feedback,
    };
  }, [student, essayIndex, essayStates]);

  const hasEssay = (student?.essays?.length ?? 0) > 0;

  const handleRubricChange = (criterionId: string, score: number) => {
    setEssayStates((prev) => {
      const next = [...prev];
      next[essayIndex] = {
        ...next[essayIndex],
        rubric: next[essayIndex].rubric.map((r) =>
          r.id === criterionId ? { ...r, score } : r,
        ),
      };
      return next;
    });
  };

  const handleFeedbackChange = (val: string) => {
    setEssayStates((prev) => {
      const next = [...prev];
      next[essayIndex] = { ...next[essayIndex], feedback: val };
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      if (!submissionId || !student) {
        toast.error("Submission эсвэл оюутны мэдээлэл олдсонгүй");
        return;
      }

      const hasInvalidRubric = essayStates.some((es) =>
        es.rubric.some(
          (r) =>
            Number.isNaN(r.score) ||
            r.score < 0 ||
            r.score > r.maxScore ||
            !Number.isFinite(r.score),
        ),
      );

      if (hasInvalidRubric) {
        toast.error("Рубрикийн оноо буруу байна. Дахин шалгана уу.");
        return;
      }

      const reviewedEssays = student.essays.map((essay, idx) => {
        const state = essayStates[idx];
        const rubric = state?.rubric ?? essay.rubric;
        const feedback = (state?.feedback ?? essay.feedback ?? "").trim();
        const score = rubric.reduce((sum, r) => sum + r.score, 0);

        return {
          questionId: essay.questionId,
          submissionAnswerId: essay.submissionAnswerId ?? null,
          score,
          feedback,
        };
      });

      if (hasEssay) {
        await saveEssayReviews(submissionId, reviewedEssays);
      }

      const rawManualScore = reviewedEssays.reduce(
        (sum, e) => sum + e.score,
        0,
      );
      const rawManualMax = student.essays.reduce(
        (sum, essay) =>
          sum +
          essay.rubric.reduce((rubricSum, r) => rubricSum + r.maxScore, 0),
        0,
      );
      const manualScore = Math.min(rawManualScore, rawManualMax);
      const finalScore = student.mcScore + manualScore;

      await publishSubmissionGrade(submissionId, finalScore, manualScore);

      setStudent((prev) =>
        prev
          ? {
              ...prev,
              status: "Дүгнэгдсэн",
              finalScore,
              essays: prev.essays.map((essay, idx) => ({
                ...essay,
                feedback: reviewedEssays[idx]?.feedback ?? essay.feedback,
              })),
            }
          : prev,
      );

      setAllStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status: "Дүгнэгдсэн",
                finalScore,
              }
            : s,
        ),
      );

      toast.success(
        "Rubric, feedback, үнэлгээ хадгалагдаж оюутанд илгээгдлээ.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Илгээх үед алдаа гарлаа");
    }
  };

  const navigateStudent = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? studentIndex - 1 : studentIndex + 1;
    if (newIndex >= 0 && newIndex < allStudents.length) {
      router.push(`/grading/${classId}/${allStudents[newIndex].id}`);
      setEssayIndex(0);
    }
  };

  if (loading) return <GradeStudentPageSkeleton />;
  if (!student || !course) {
    return <div className="p-8 text-gray-500">Оюутан олдсонгүй.</div>;
  }
  const totalRubricScore = essayStates.reduce(
    (sum, es) => sum + es.rubric.reduce((s2, r) => s2 + r.score, 0),
    0,
  );
  const gradedCount = allStudents.filter(
    (s) => s.status === "Дүгнэгдсэн",
  ).length;
  const pendingCount = allStudents.filter(
    (s) => s.status === "Хүлээгдэж байна",
  ).length;
  const maxRubricScore = student.essays.reduce(
    (sum, e) => sum + e.rubric.reduce((s2, r) => s2 + r.maxScore, 0),
    0,
  );
  const autoScore = student.mcScore;
  const autoTotal = student.mcTotal;
  const manualScore = Math.min(totalRubricScore, maxRubricScore);
  const manualTotal = maxRubricScore;
  const totalScore = autoScore + manualScore;
  const maxTotalScore = autoTotal + manualTotal;
  const finalPercent =
    maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <GradingHeader
        classId={classId}
        totalStudents={allStudents.length}
        gradedCount={gradedCount}
        pendingCount={pendingCount}
      />
      <StudentInfoHeader
        student={student}
        currentEssay={hasEssay ? essayIndex + 1 : 0}
        totalEssays={student.essays.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {hasEssay ? (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              {currentEssay ? (
                <EssaySubmission
                  essay={currentEssay}
                  essayIndex={essayIndex}
                  totalEssays={student.essays.length}
                  onSelectEssay={setEssayIndex}
                  onPrev={() => setEssayIndex((i) => Math.max(0, i - 1))}
                  onNext={() =>
                    setEssayIndex((i) =>
                      Math.min(student.essays.length - 1, i + 1),
                    )
                  }
                />
              ) : (
                <div className="p-8 text-gray-500">
                  Эссе мэдээлэл олдсонгүй.
                </div>
              )}
            </div>

            {currentEssay && (
              <GradingSidebar
                mcScore={autoScore}
                mcTotal={autoTotal}
                manualScore={manualScore}
                manualTotal={manualTotal}
                currentEssay={currentEssay}
                onRubricChange={handleRubricChange}
                onFeedbackChange={handleFeedbackChange}
                totalScore={totalScore}
                maxTotalScore={maxTotalScore}
                finalPercent={finalPercent}
                onSubmit={handleSubmit}
                onPrevStudent={() => navigateStudent("prev")}
                onNextStudent={() => navigateStudent("next")}
              />
            )}
          </>
        ) : (
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-2xl bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Эссе/бичгийн хариулт олдсонгүй
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Оюутан:{" "}
                  <span className="font-medium text-gray-900">
                    {student.name}
                  </span>
                </p>
                <p>
                  Тестийн оноо:{" "}
                  <span className="font-medium text-gray-900">
                    {student.mcScore}/{student.mcTotal}
                  </span>
                </p>
                <p>
                  Нийт дүн:{" "}
                  <span className="font-bold text-[#31A8E0]">
                    {totalScore}/{maxTotalScore}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-[#31A8E0] hover:bg-[#2696CB] text-white text-sm font-semibold"
                >
                  Дүн хадгалах
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700"
                >
                  Оюутанд илгээх
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeStudentPage;
