"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExamHeader, ExamProgressBar, ExamQA } from "./_components";
import { ProctoringGuard } from "./_components/ProctoringGuard";
import { ExamProvider } from "./_hooks/use-exam-states";
import { useExamData } from "./_hooks/use-exam-data";

const Exam = () => {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const { data, loading, error } = useExamData(examId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Шалгалтыг ачаалж байна...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!data || data.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center text-sm text-gray-500">
        Энэ шалгалтад асуулт олдсонгүй.
      </div>
    );
  }

  return (
    <ExamProvider exam={data.exam} questions={data.questions}>
      <ExamContent />
    </ExamProvider>
  );
};

export default Exam;

export const ExamContent = () => {
  const [warningCount, setWarningCount] = useState<number>(0);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recordWarning = (message: string) => {
    setWarningCount((prev) => {
      const next = prev + 1;
      console.log(`[exam-warning:${next}] ${message}`);
      return next;
    });
  };

  useEffect(() => {
    console.log(`[exam-warning-count] ${warningCount}`);
  }, [warningCount]);

  useEffect(() => {
    const handleWindowLeave = () => {
      if (document.hidden) return;
      recordWarning("Цонхноос гарлаа!");
    };
    document.addEventListener("mouseleave", handleWindowLeave);
    return () => document.removeEventListener("mouseleave", handleWindowLeave);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordWarning("Tab сольж болохгүй!");
      }
    };

    const handleWindowBlur = () => {
      if (document.hidden) return;
      recordWarning("Цонхноос гарлаа!");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const handleExamLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      console.log("[exam-warning] Шалгалтын хэсгээс гарах оролдлого илэрлээ");
    }, 100);
  };

  const handleExamEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden"
      id="exam-area"
    >
      <ProctoringGuard />
      <ExamHeader />
      <div
        className="flex flex-1 overflow-hidden"
        onMouseLeave={handleExamLeave}
        onMouseEnter={handleExamEnter}
      >
        <div className="flex-1 overflow-y-auto">
          <ExamQA />
        </div>
        <ExamProgressBar />
      </div>
    </div>
  );
};
