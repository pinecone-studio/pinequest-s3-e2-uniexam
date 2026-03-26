"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, CircleCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";

type GradingHeaderProps = {
  classId: string;
  totalStudents: number;
  gradedCount: number;
  pendingCount: number;
};

export const GradingHeader = ({
  classId,
  totalStudents,
  gradedCount,
  pendingCount,
}: GradingHeaderProps) => {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push(`/grading/${classId}`)}
          variant={"ghost"}
        >
          <ChevronLeft size={16} />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Шалгалтыг Дүгнэх</h1>
          <p className="text-sm text-gray-500">
            {pendingCount} хүлээгдэж буй шалгалт
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CircleCheckBig
          size={16}
          className="text-green-600"
          strokeWidth={2.5}
        />
        <span>
          {gradedCount} / {totalStudents} Дүгнэгдсэн
        </span>
      </div>
    </header>
  );
};
