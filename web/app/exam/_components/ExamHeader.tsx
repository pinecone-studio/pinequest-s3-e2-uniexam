"use client";
import { useRouter } from "next/navigation";
import { useExamState } from "../_hooks/use-exam-states";
import { ChevronLeft } from "lucide-react";

const localizeExamLabel = (value: string) =>
  value
    .replaceAll("Algorithms", "Алгоритмын")
    .replaceAll("Mock Course", "Туршилтын хичээл")
    .replaceAll("Mock Exam", "Туршилтын шалгалт")
    .replaceAll("Alpha", "Альфа");

export const ExamHeader = () => {
  const { exam } = useExamState();
  const router = useRouter();
  const localizedSubtitle = exam.subtitle
    ? localizeExamLabel(exam.subtitle)
    : undefined;
  const localizedTitle = localizeExamLabel(exam.title);

  return (
    <div className="border-b text-muted-foreground text-sm px-6 py-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <ChevronLeft
            onClick={() => router.back()}
            className="hover:cursor-pointer"
          />
          <p>
            {localizedSubtitle
              ? `${localizedSubtitle} - ${localizedTitle}`
              : localizedTitle}
          </p>
        </div>
      </div>
    </div>
  );
};
