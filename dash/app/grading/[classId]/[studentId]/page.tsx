"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mockClasses, studentsByClass } from "../../mockData";
import { RubricCriterion } from "@/lib/grading/types";
import { toast } from "sonner";
import { GradingHeader } from "./_components/GradingHeader";
import { StudentInfoHeader } from "./_components/StudentInfoHeader";
import { EssaySubmission } from "./_components/EssaySubmission";
import { GradingSidebar } from "./_components/GradingSidebar";

const GradeStudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const studentId = params.studentId as string;

  const course = mockClasses.find((c) => c.id === classId);
  const allStudents = studentsByClass[classId] ?? [];
  const studentIndex = allStudents.findIndex((s) => s.id === studentId);
  const student = allStudents[studentIndex];

  const [essayIndex, setEssayIndex] = useState<number>(0);

  const [essayStates, setEssayStates] = useState(() =>
    (student?.essays ?? []).map((e) => ({
      rubric: e.rubric.map((r) => ({ ...r })) as RubricCriterion[],
      feedback: e.feedback,
    })),
  );

  const currentEssay = useMemo(() => {
    if (!student) return null;
    return {
      ...student.essays[essayIndex],
      rubric:
        essayStates[essayIndex]?.rubric ?? student.essays[essayIndex].rubric,
      feedback:
        essayStates[essayIndex]?.feedback ??
        student.essays[essayIndex].feedback,
    };
  }, [student, essayIndex, essayStates]);

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

  const handleSubmit = () => {
    toast.success("Оноо амжилттай хадгалагдлаа!");
  };

  const navigateStudent = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? studentIndex - 1 : studentIndex + 1;
    if (newIndex >= 0 && newIndex < allStudents.length) {
      router.push(`/grading/${classId}/${allStudents[newIndex].id}`);
      setEssayIndex(0);
    }
  };

  if (!student || !course || !currentEssay) {
    return <div className="p-8 text-gray-500">Оюутан олдсонгүй.</div>;
  }

  const gradedCount = allStudents.filter(
    (s) => s.status === "Дүгнэгдсэн",
  ).length;
  const pendingCount = allStudents.filter(
    (s) => s.status === "Хүлээгдэж байна",
  ).length;

  const totalRubricScore = essayStates.reduce(
    (sum, es) => sum + es.rubric.reduce((s2, r) => s2 + r.score, 0),
    0,
  );
  const maxRubricScore = student.essays.reduce(
    (sum, e) => sum + e.rubric.reduce((s2, r) => s2 + r.maxScore, 0),
    0,
  );
  const totalScore = student.mcScore + totalRubricScore;
  const maxTotalScore = student.mcTotal + maxRubricScore;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <GradingHeader
        classId={classId}
        totalStudents={allStudents.length}
        gradedCount={gradedCount}
        pendingCount={pendingCount}
      />
      <StudentInfoHeader
        student={student}
        currentEssay={essayIndex + 1}
        totalEssays={student.essays.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <EssaySubmission
            essay={currentEssay}
            essayIndex={essayIndex}
            totalEssays={student.essays.length}
            onPrev={() => setEssayIndex((i) => Math.max(0, i - 1))}
            onNext={() =>
              setEssayIndex((i) => Math.min(student.essays.length - 1, i + 1))
            }
          />
        </div>

        {/* <GradingSidebar
          mcScore={student.mcScore}
          mcTotal={student.mcTotal}
          currentEssay={currentEssay}
          onRubricChange={handleRubricChange}
          onFeedbackChange={handleFeedbackChange}
          totalScore={totalScore}
          maxTotalScore={maxTotalScore}
          onSubmit={handleSubmit}
          onPrevStudent={() => navigateStudent("prev")}
          onNextStudent={() => navigateStudent("next")}
        /> */}
      </div>
    </div>
  );
};

export default GradeStudentPage;
