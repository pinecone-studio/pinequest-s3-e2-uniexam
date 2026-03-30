"use client";

import { useState, type KeyboardEvent } from "react";
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  Download,
} from "lucide-react";
import { Student } from "../type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentTableProps {
  students: Student[];
}

const trendMeta = {
  up: { icon: TrendingUp, className: "text-green-600" },
  down: { icon: TrendingDown, className: "text-red-500" },
  stable: { icon: Minus, className: "text-gray-500" },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const StudentTable = ({ students }: StudentTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleKey = (
    e: KeyboardEvent<HTMLTableRowElement>,
    student: Student
  ) => {
    if (e.key === "Enter") handleView(student);
  };

  return (
    <>
      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-white">
              <th className="px-6 py-4 text-sm font-semibold">Оюутан</th>
              <th className="px-6 py-4 text-sm font-semibold">Курс</th>
              <th className="px-6 py-4 text-sm font-semibold">Дундаж</th>
              <th className="px-6 py-4 text-sm font-semibold">Шалгалт</th>
              <th className="px-6 py-4 text-sm font-semibold">Ахиц</th>
              <th className="px-6 py-4 text-sm font-semibold">Сүүлд</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => {
              const TrendIcon = trendMeta[s.trend].icon;

              /* 🔥 CONDITION */
              const isMissing = s.examsTaken === 0;
              const isLow = s.averageScore < 70 && !isMissing;

              return (
                <tr
                  key={s.id}
                  onClick={() => handleView(s)}
                  onKeyDown={(e) => handleKey(e, s)}
                  tabIndex={0}
                  className={`cursor-pointer transition
                    ${
                      isMissing
                        ? "bg-red-50 hover:bg-red-100"
                        : isLow
                        ? "bg-yellow-50 hover:bg-yellow-100"
                        : "hover:bg-gray-50"
                    }`}
                >
                  {/* NAME */}
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-gray-500">
                          {s.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* COURSE */}
                  <td className="px-6 py-4">{s.course}</td>

                  {/* SCORE */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold
                          ${
                            isMissing
                              ? "text-red-500"
                              : isLow
                              ? "text-yellow-600"
                              : s.averageScore > 80
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                      >
                        {isMissing ? "—" : `${s.averageScore}%`}
                      </span>

                      {!isMissing && (
                        <div className="w-24 h-2 bg-gray-100 rounded-full">
                          <div
                            className={`h-full rounded-full
                              ${
                                isLow
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                              }`}
                            style={{ width: `${s.averageScore}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* EXAMS */}
                  <td className="px-6 py-4 text-sm">
                    {isMissing ? (
                      <span className="text-red-500 font-medium">
                        Шалгалт өгөөгүй
                      </span>
                    ) : isLow ? (
                      <span className="text-yellow-600 font-medium">
                        ⚠ Тэнцээгүй
                      </span>
                    ) : (
                      `${s.examsTaken} шалгалт`
                    )}
                  </td>

                  {/* TREND */}
                  <td className="px-6 py-4">
                    <TrendIcon className={trendMeta[s.trend].className} />
                  </td>

                  {/* LAST */}
                  <td className="px-6 py-4 text-gray-500">
                    {s.lastActive}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          И-мэйл
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Татах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Илэрц олдсонгүй
          </div>
        )}
      </div>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {selectedStudent && (
            <>
              <DialogTitle>{selectedStudent.name}</DialogTitle>
              <DialogDescription>
                {selectedStudent.email}
              </DialogDescription>

              <div className="mt-4">
                {selectedStudent.examsTaken === 0 ? (
                  <div className="text-red-500">
                    ⚠ Шалгалт өгөөгүй
                  </div>
                ) : selectedStudent.averageScore < 60 ? (
                  <div className="text-yellow-600">
                    ⚠ Тэнцээгүй
                  </div>
                ) : (
                  <div>
                    Дундаж: {selectedStudent.averageScore}%
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentTable;