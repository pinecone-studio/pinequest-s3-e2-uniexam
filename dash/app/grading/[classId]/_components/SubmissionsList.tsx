"use client";

import { Student } from "@/lib/grading/types";
import { CircleCheckBig, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type SubmissionsListProps = {
  students: Student[];
  classId: string;
};

export const SubmissionsList = ({
  students,
  classId,
}: SubmissionsListProps) => {
  const router = useRouter();

  if (students.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Тохирох оюутан олдсонгүй.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-700">Дараалал</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {students.map((student) => (
          <div
            key={student.id}
            onClick={() => router.push(`/grading/${classId}/${student.id}`)}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {student.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {student.name}
                </p>
                <p className="text-xs text-gray-400">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex flex-col gap-1 w-20">
                <div className="flex items-center gap-1">
                  <Clock size={14} strokeWidth={2.5} />
                  {student.submittedAt}
                </div>
                {student.status === "Дүгнэгдсэн" &&
                  student.finalScore !== null &&
                  student.finalScore !== undefined && (
                    <span className="font-medium text-gray-800">
                      {student.finalScore}
                    </span>
                  )}
              </div>
              <div className="w-36">
                {student.status === "Дүгнэгдсэн" ? (
                  <span className="flex items-center justify-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                    <CircleCheckBig size={14} strokeWidth={2.5} />
                    Дүгнэгдсэн
                  </span>
                ) : (
                  <span className="flex justify-center items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                    <Clock size={14} strokeWidth={2.5} />
                    Хүлээгдэж байна
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
