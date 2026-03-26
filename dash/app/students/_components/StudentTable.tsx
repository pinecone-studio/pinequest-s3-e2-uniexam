"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  Download,
  Eye,
  X,
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentTableProps {
  students: Student[];
}

const trendMeta = {
  up: {
    icon: TrendingUp,
    label: "Өссөн",
    className: "text-green-600",
  },
  down: {
    icon: TrendingDown,
    label: "Буурсан",
    className: "text-red-500",
  },
  stable: {
    icon: Minus,
    label: "Тогтвортой",
    className: "text-gray-500",
  },
} satisfies Record<
  Student["trend"],
  {
    icon: typeof TrendingUp;
    label: string;
    className: string;
  }
>;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getExamScoreClass = (score: number, maxScore: number) =>
  score / maxScore >= 0.9 ? "text-green-600" : "text-blue-600";

const StudentTable = ({ students }: StudentTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const activeTrend = selectedStudent ? trendMeta[selectedStudent.trend] : null;
  const ActiveTrendIcon = activeTrend?.icon;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Оюутан
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Курс
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Дундаж оноо
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Өгсөн шалгалт
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                Ахиц
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">
                Сүүлд
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student) => {
              const rowTrend = trendMeta[student.trend];
              const RowTrendIcon = rowTrend.icon;

              return (
                <tr
                  key={student.id}
                  className="group transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {student.course}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-bold ${
                          student.averageScore > 90
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {student.averageScore}%
                      </span>
                      <div className="h-2 w-24 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${student.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {student.examsTaken} шалгалт
                  </td>
                  <td className="px-4 py-7">
                    <div className="flex justify-center">
                      <RowTrendIcon
                        className={`h-4 w-4 ${rowTrend.className}`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`${student.name} үйлдлүүд`}
                            className="rounded-md p-2 outline-none transition-colors hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1">
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onSelect={(event) => {
                              event.preventDefault();
                              handleViewDetails(student);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Дэлгэрэнгүй
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 text-gray-700">
                            <Mail className="h-4 w-4" />
                            И-мэйл илгээх
                          </DropdownMenuItem>
                          <DropdownMenuItem className="mt-1 cursor-pointer gap-2 border-t pt-2 text-gray-700">
                            <Download className="h-4 w-4" />
                            Дүн татах
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">
            Илэрц олдсонгүй.
          </div>
        )}
      </div>

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedStudent(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden border border-gray-200 bg-white p-0 ring-0 shadow-[0_24px_90px_rgba(15,23,42,0.2)] sm:max-w-[560px] sm:rounded-[22px]"
        >
          {selectedStudent && (
            <div className="relative p-4 sm:p-5">
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Дэлгэрэнгүйг хаах"
                  className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-md border-2 border-sky-500 bg-white text-sky-500 shadow-sm transition-colors hover:bg-sky-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </DialogClose>

              <div className="mb-5 flex items-start justify-between pr-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-[1.2rem] font-semibold text-blue-600">
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <DialogTitle className="text-[1.3rem] font-bold tracking-tight text-gray-900">
                      {selectedStudent.name}
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-sm text-gray-500">
                      {selectedStudent.email}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2.5">
                <div className="flex min-h-[100px] flex-col items-center justify-center rounded-[16px] border border-gray-200 bg-white p-3 text-center shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
                  <div className="mb-1 text-[1.45rem] font-bold text-gray-900">
                    {selectedStudent.averageScore}%
                  </div>
                  <div className="text-xs text-gray-500">Дундаж оноо</div>
                </div>
                <div className="flex min-h-[100px] flex-col items-center justify-center rounded-[16px] border border-gray-200 bg-white p-3 text-center shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
                  <div className="mb-1 text-[1.45rem] font-bold text-gray-900">
                    {selectedStudent.examsTaken}
                  </div>
                  <div className="text-xs text-gray-500">Шалгалтын тоо</div>
                </div>
                <div className="flex min-h-[100px] flex-col items-center justify-center rounded-[16px] border border-gray-200 bg-white p-3 text-center shadow-[0_3px_12px_rgba(15,23,42,0.08)]">
                  {ActiveTrendIcon && activeTrend && (
                    <div
                      className={`mb-1 flex items-center gap-1 text-base font-medium ${activeTrend.className}`}
                    >
                      <ActiveTrendIcon className="h-3.5 w-3.5" />
                      {activeTrend.label}
                    </div>
                  )}
                  <div className="max-w-[6rem] text-center text-xs leading-4 text-gray-500">
                    Гүйцэтгэлийн
                    <br />
                    чиг хандлага
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
                <div className="px-4 pb-3 pt-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    Шалгалтын түүх
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 text-sm text-gray-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">
                        Шалгалт
                      </th>
                      <th className="px-4 py-2.5 text-left font-semibold">
                        Огноо
                      </th>
                      <th className="px-4 py-2.5 text-left font-semibold">
                        Оноо
                      </th>
                      <th className="px-4 py-2.5 text-left font-semibold">
                        Үнэлгээ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedStudent.examHistory.length > 0 ? (
                      selectedStudent.examHistory.map((exam) => (
                        <tr key={exam.id}>
                          <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-900">
                            {exam.name}
                          </td>
                          <td className="px-4 py-2.5 text-[13px] text-gray-500">
                            {exam.date}
                          </td>
                          <td
                            className={`px-4 py-2.5 text-[13px] font-semibold ${getExamScoreClass(
                              exam.score,
                              exam.maxScore,
                            )}`}
                          >
                            {exam.score}/{exam.maxScore}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex min-w-9 items-center justify-center rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                              {exam.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-sm text-gray-500"
                        >
                          Шалгалтын түүх алга.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentTable;
