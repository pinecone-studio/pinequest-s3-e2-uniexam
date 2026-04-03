"use client";

import { useState, type KeyboardEvent } from "react";
import { MoreHorizontal, Mail, Download } from "lucide-react";
import { motion } from "framer-motion";

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
import { TooltipProvider } from "@/components/ui/tooltip";

import { Student } from "../type";

interface StudentTableProps {
  students: Student[];
}

type EmailTemplate = "reminder" | "score" | "violation";

const getInitials = (name: string) =>
  name
    ?.split(" ")
    ?.filter(Boolean)
    ?.map((p) => p[0])
    ?.join("")
    ?.toUpperCase() || "";

const formatPercent = (value: number | null) => {
  if (value === null) return "-";
  return `${value.toFixed(1)}%`;
};

const StudentTable = ({ students }: StudentTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [headerElevated, setHeaderElevated] = useState(false);

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleKey = (
    e: KeyboardEvent<HTMLTableRowElement>,
    student: Student,
  ) => {
    if (e.key === "Enter") handleView(student);
  };

  const buildTemplate = (student: Student, template: EmailTemplate) => {
    if (template === "score") {
      return {
        subject: `${student.name} - Дүнгийн мэдээлэл`,
        body: `Сайн байна уу, ${student.name}.\n\nТаны дүн: ${formatPercent(student.finalScore)}\nШалгалтын тоо: ${student.examsTaken}\n\nХүндэтгэсэн.`,
      };
    }

    if (template === "violation") {
      return {
        subject: `${student.name} - Зөрчил анхааруулга`,
        body: `Сайн байна уу, ${student.name}.\n\nТаны зөрчлийн тоо: ${student.violationCount}\nДэлгэрэнгүй мэдээллийг багшаасаа лавлана уу.\n\nХүндэтгэсэн.`,
      };
    }

    return {
      subject: `${student.name} - Санамж`,
      body: `Сайн байна уу, ${student.name}.\n\nЭнэ бол танд зориулсан санамж мессеж юм.\n\nХүндэтгэсэн.`,
    };
  };

  const sendEmail = (student: Student, template: EmailTemplate) => {
    const message = buildTemplate(student, template);
    const mailto = `mailto:${student.email}?subject=${encodeURIComponent(
      message.subject,
    )}&body=${encodeURIComponent(message.body)}`;
    window.open(mailto, "_self");
  };

  const downloadStudent = (student: Student) => {
    const payload = {
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.className,
      course: student.course,
      major: student.major,
      examTitle: student.examTitle,
      examsTaken: student.examsTaken,
      violationCount: student.violationCount,
      finalScore: student.finalScore,
      lastActive: student.lastActive,
      examHistory: student.examHistory,
    };

    const text = JSON.stringify(payload, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      text,
    )}`;

    const safeName = (student.name || "student")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "");
    const filename = `${safeName || student.id}_info.json`;

    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataUri);
    anchor.setAttribute("download", filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <TooltipProvider>
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div
          className="max-h-[70vh] overflow-auto"
          onScroll={(e) => {
            const target = e.currentTarget;
            setHeaderElevated(target.scrollTop > 4);
          }}
        >
          <table className="w-full text-left">
            <thead>
              <tr
                className={`border-b bg-white transition-shadow duration-200 ${
                  headerElevated ? "shadow-[0_2px_10px_rgba(15,23,42,0.08)]" : ""
                }`}
              >
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Оюутнууд
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Анги
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Шалгалтын нэр
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Курс
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Шалгалтын тоо
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Зөрчилийн тоо
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold">
                  Дүн
                </th>
                <th className="sticky top-0 z-10 bg-white"></th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, index) => {
                return (
                  <motion.tr
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleView(s)}
                    onKeyDown={(e) => handleKey(e, s)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: index * 0.035 }}
                    className="group cursor-pointer transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.15)]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          {/* <div className="text-xs text-gray-500">{s.email}</div> */}
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
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.finalScore === null ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <span className="text-sm font-medium text-blue-700">
                          {formatPercent(s.finalScore)}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 transition-all duration-200 ease-out md:translate-x-1 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100">
                        <button
                          title="И-мэйл (Санамж)"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendEmail(s, "reminder");
                          }}
                          className="rounded p-2 text-slate-600 transition-all duration-200 ease-out hover:bg-gray-100 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                          <Mail className="h-4 w-4" />
                        </button>

                        <button
                          title="Татах"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadStudent(s);
                          }}
                          className="rounded p-2 text-slate-600 transition-all duration-200 ease-out hover:bg-gray-100 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              title="Үйлдлүүд"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded p-2 transition-all duration-200 ease-out hover:bg-gray-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                sendEmail(s, "reminder");
                              }}
                              className="transition-all duration-200 ease-out active:scale-[0.98] focus-visible:bg-blue-50"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              И-мэйл (Санамж)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                sendEmail(s, "score");
                              }}
                              className="transition-all duration-200 ease-out active:scale-[0.98] focus-visible:bg-blue-50"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              И-мэйл (Дүнгийн мэдээлэл)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                sendEmail(s, "violation");
                              }}
                              className="transition-all duration-200 ease-out active:scale-[0.98] focus-visible:bg-blue-50"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              И-мэйл (Зөрчил анхааруулга)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                downloadStudent(s);
                              }}
                              className="transition-all duration-200 ease-out active:scale-[0.98] focus-visible:bg-blue-50"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Татах
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
                  <p className="font-medium">
                    {selectedStudent.violationCount}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Дүн</p>
                  <p className="font-medium">
                    {formatPercent(selectedStudent.finalScore)}
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
                          <p className="text-xs text-gray-500">
                            {exam.date ?? "-"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPercent(exam.score)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {exam.grade ?? "-"}
                          </p>
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
    </TooltipProvider>
  );
};

export default StudentTable;
