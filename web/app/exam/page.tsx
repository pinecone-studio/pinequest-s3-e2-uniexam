"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ExamHeader, ExamProgressBar, ExamQA } from "./_components";
import ProctoringGuard from "./_components/ProctoringGuard";
import { ExamProvider } from "./_hooks/use-exam-states";

const WARNING_TOAST_CLASS =
  "bg-red-600 text-white font-bold border border-red-800";

const Exam = () => {
  return (
    <ExamProvider>
      <ExamContent />
    </ExamProvider>
  );
};

export default Exam;

export const ExamContent = () => {
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningCountRef = useRef<number>(0);
  const lastWarningAtRef = useRef<number>(0);

  useEffect(() => {
    const showWarningToast = (message: string) => {
      const now = Date.now();

      if (now - lastWarningAtRef.current < 800) {
        return;
      }

      lastWarningAtRef.current = now;
      warningCountRef.current += 1;

      toast.warning(`Анхааруулга ${warningCountRef.current}: ${message}`, {
        className: WARNING_TOAST_CLASS,
      });
    };

    const handlePointerLeavePage = (event: MouseEvent) => {
      if (document.hidden) {
        return;
      }

      if (event.relatedTarget) {
        return;
      }

      if (event.clientY <= 0) {
        showWarningToast("Tab hover хийх оролдлого илэрлээ!");
        return;
      }

      showWarningToast("Цонхноос гарлаа!");
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        return;
      }

      showWarningToast("Tab солих оролдлого илэрлээ!");
    };

    window.addEventListener("mouseout", handlePointerLeavePage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mouseout", handlePointerLeavePage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const handleExamLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      toast.error("Шалгалтын хэсгээс гарах оролдлого илэрлээ");
    }, 100);
  };

  const handleExamEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
  };

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-gray-50"
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
