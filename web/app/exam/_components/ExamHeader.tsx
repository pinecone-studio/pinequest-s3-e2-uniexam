"use client";
import { useRouter } from "next/navigation";
import { useExamState } from "../_hooks/use-exam-states";
import { ChevronLeft } from "lucide-react";
import { examName, mockExam } from "../mockExamData";

export const ExamHeader = () => {
  const { totalQuestions, currentId } = useExamState();
  const router = useRouter();
  return (
    <div className="border-b text-muted-foreground text-sm px-6 py-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <ChevronLeft
            onClick={() => router.back()}
            className="hover:cursor-pointer"
          />
          <p>{examName.title}</p>
        </div>
      </div>
    </div>
  );
};
