"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type SubmissionsHeaderProps = {
  classCode: string;
  className: string;
  pendingCount: number;
};

export const SubmissionsHeader = ({
  classCode,
  className,
  pendingCount,
}: SubmissionsHeaderProps) => {
  const router = useRouter();

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
      <Button onClick={() => router.push("/grading")} variant={"ghost"}>
        <ChevronLeft size={16} />
      </Button>
      <div>
        <h1 className="text-lg font-bold text-gray-900">
          {classCode} - Шалгалт Дүгнэх
        </h1>
        <p className="text-xs text-gray-500">{className}</p>
        <p className="text-xs text-gray-500">
          {pendingCount} хүлээгдэж буй хариулт
        </p>
      </div>
    </header>
  );
};
