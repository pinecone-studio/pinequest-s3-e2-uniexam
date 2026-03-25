"use client";

import { useEffect, useRef, useState } from "react";
import { ExamHeader, ExamProgressBar, ExamQA } from "./_components";
import ProctoringGuard from "./_components/ProctoringGuard";
import { ExamProvider } from "./_hooks/use-exam-states";
import { toast } from "sonner";

const Exam = () => {
  return (
    <ExamProvider>
      <ExamContent />
    </ExamProvider>
  );
};

export default Exam;

export const ExamContent = () => {
  const [warningCount, setWarningCount] = useState<number>(0);
  const [isOutside, setIsOutside] = useState<boolean>(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleWindowLeave = () => {
      setWarningCount((prev) => prev + 1);
      toast.warning(`Анхааруулга ${warningCount + 1}: Цонхноос гарлаа!`, {
        className: "bg-red-600 text-white font-bold border border-red-800",
      });
    };
    document.addEventListener("mouseleave", handleWindowLeave);
    return () => document.removeEventListener("mouseleave", handleWindowLeave);
  }, [warningCount]);

  const handleExamLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOutside(true);
      toast.error("Шалгалтын хэсгээс гарах оролдлого илэрлээ");
    }, 100);
  };

  const handleExamEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    setIsOutside(false);
  };

  return (
    <div
      className="flex flex-col h-screen bg-gray-50 overflow-hidden"
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
