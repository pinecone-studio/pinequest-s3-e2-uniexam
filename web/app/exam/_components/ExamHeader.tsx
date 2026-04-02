"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useExamState } from "../_hooks/use-exam-states";
import { ChevronLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getExamReturnToFromSearchParams } from "@/lib/exam-navigation";

const localizeExamLabel = (value: string) =>
  value
    .replaceAll("Algorithms", "Алгоритмын")
    .replaceAll("Mock Course", "Туршилтын хичээл")
    .replaceAll("Mock Exam", "Туршилтын шалгалт")
    .replaceAll("Alpha", "Альфа");

export const ExamHeader = () => {
  const { exam } = useExamState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const returnTo = getExamReturnToFromSearchParams(searchParams);
  const localizedSubtitle = exam.subtitle
    ? localizeExamLabel(exam.subtitle)
    : undefined;
  const localizedTitle = localizeExamLabel(exam.title);

  return (
    <>
      <div className="border-b text-muted-foreground text-sm px-6 py-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLeaveDialogOpen(true)}
              className="transition hover:cursor-pointer hover:text-[#006d77]"
              aria-label="Шалгалтаас гарах"
            >
              <ChevronLeft />
            </button>
            <p>
              {localizedSubtitle
                ? `${localizedSubtitle} - ${localizedTitle}`
                : localizedTitle}
            </p>
          </div>
        </div>
      </div>
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Та шалгалтаас гарахдаа итгэлтэй байна уу?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 pt-4">
            <AlertDialogCancel>Үлдэх</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(returnTo)}
              className="bg-[#00565e] text-white hover:bg-[#00565e]"
            >
              Гарах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
