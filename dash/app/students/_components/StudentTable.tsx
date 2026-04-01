"use client";

import { useState, type KeyboardEvent } from "react";
import {
  MoreHorizontal,
  Mail,
  Download,
} from "lucide-react";

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
  DialogHeader,
} from "@/components/ui/dialog";

import { Student } from "../type";

interface StudentTableProps {
  students: Student[];
}

const getInitials = (name: string) =>
  name
    ?.split(" ")
    ?.filter(Boolean)
    ?.map((p) => p[0])
    ?.join("")
    ?.toUpperCase() || "";

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
              <th className="px-6 py-4 text-sm font-semibold">Анги</th>
              <th className="px-6 py-4 text-sm font-semibold">Шалгалтын нэр</th>
              <th className="px-6 py-4 text-sm font-semibold">Курс</th>
              <th className="px-6 py-4 text-sm font-semibold">Шалгалтын тоо</th>
              <th className="px-6 py-4 text-sm font-semibold">Зөрчилийн тоо</th>
              <th className="px-6 py-4 text-sm font-semibold">Дүн</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => {
              return (
                <tr
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleView(s)}
                  onKeyDown={(e) => handleKey(e, s)}
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">{s.className}</td>
                  <td className="px-6 py-4">{s.examTitle}</td>
                  <td className="px-6 py-4">{s.course}</td>
                  <td className="px-6 py-4">{s.examsTaken}</td>
                  <td className="px-6 py-4">
                    {s.violationCount > 0 ? (
                      <span className="text-sm font-medium text-red-500">
                        {s.violationCount}
                      </span>
                    ) : (
                      <span className="text-sm text-black-400">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {s.finalScore === null ? (
                      <span className="text-black-500">-</span>
                    ) : (
                      <span className="text-sm font-medium  text-blue-700">
                        {s.finalScore}
                      </span>
                    )}
                  </td>

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
          <div className="p-6 text-center text-gray-500">Илэрц олдсонгүй</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl space-y-4">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name}</DialogTitle>
            <DialogDescription>{selectedStudent?.email}</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Код</p>
                  <p className="font-medium">{selectedStudent.className}</p>
                </div>

                <div>
                  <p className="text-gray-500">Курс</p>
                  <p className="font-medium">{selectedStudent.course}</p>
                </div>

                <div>
                  <p className="text-gray-500">Мэргэжил</p>
                  <p className="font-medium">{selectedStudent.major}</p>
                </div>

                <div>
                  <p className="text-gray-500">Сүүлийн шалгалт</p>
                  <p className="font-medium">{selectedStudent.examTitle}</p>
                </div>

                <div>
                  <p className="text-gray-500">Шалгалтын тоо</p>
                  <p className="font-medium">{selectedStudent.examsTaken}</p>
                </div>

                <div>
                  <p className="text-gray-500">Зөрчлийн тоо</p>
                  <p className="font-medium">{selectedStudent.violationCount}</p>
                </div>

                <div>
                  <p className="text-gray-500">Дүн</p>
                  <p className="font-medium">
                    {selectedStudent.finalScore === null
                      ? "-"
                      : selectedStudent.finalScore}
                  </p>
                </div>
              </div>

              {selectedStudent.examHistory.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Шалгалтын түүх</p>

                  <div className="space-y-2">
                    {selectedStudent.examHistory.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex justify-between border rounded p-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-xs text-gray-500">{exam.date ?? "-"}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            {exam.score ?? "-"}/{exam.maxScore ?? "-"}
                          </p>
                          <p className="text-xs text-gray-500">{exam.grade ?? "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentTable;
