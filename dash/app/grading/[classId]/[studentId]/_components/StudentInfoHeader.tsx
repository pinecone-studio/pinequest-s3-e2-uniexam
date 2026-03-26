"use client";

import { Student } from "@/lib/grading/types";

type StudentInfoHeaderProps = {
  student: Student;
  currentEssay: number;
  totalEssays: number;
};

export const StudentInfoHeader = ({
  student,
  currentEssay,
  totalEssays,
}: StudentInfoHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
          {student.initials}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {student.name}
          </h2>
          <p className="text-xs text-gray-400">{student.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Тест:{" "}
          <span className="font-medium text-gray-800">
            {student.mcScore}/{student.mcTotal}
          </span>
        </span>
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200">
          Эссе {currentEssay}/{totalEssays}
        </span>
      </div>
    </div>
  );
};
