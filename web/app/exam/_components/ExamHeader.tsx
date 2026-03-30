"use client";
import { useRouter } from "next/navigation";
import { useExamState } from "../_hooks/use-exam-states";
import { ChevronLeft } from "lucide-react";

export const ExamHeader = () => {
  const { exam } = useExamState();
  const router = useRouter();

  return (
    <div className="border-b text-muted-foreground text-sm px-6 py-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <ChevronLeft
            onClick={() => router.back()}
            className="hover:cursor-pointer"
          />
          <p>{exam.subtitle ? `${exam.subtitle} - ${exam.title}` : exam.title}</p>
        </div>
      </div>
    </div>
  );
};
