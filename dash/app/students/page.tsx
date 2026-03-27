"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentTable from "./_components/StudentTable";
import { useStudentSearch } from "./_hooks/use-student-search";
import { ExamHistory, Student } from "./type";

const examHistoryTemplate = [
  { name: "Явцын шалгалт", date: "2026.03.15", delta: 3 },
  { name: "Сорил 2", date: "2026.03.10", delta: -4 },
  { name: "Сорил 1", date: "2026.02.28", delta: 0 },
  { name: "Бие даалт 2", date: "2026.02.20", delta: -2 },
  { name: "Бие даалт 1", date: "2026.02.10", delta: 2 },
] as const;

const clampScore = (score: number) => Math.min(99, Math.max(55, score));

const getGrade = (score: number) => {
  if (score >= 95) return "A";
  if (score >= 90) return "A-";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "B-";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";

  return "D";
};

const buildMockExamHistory = (
  averageScore: number,
  examsTaken: number,
): ExamHistory[] =>
  examHistoryTemplate.slice(0, examsTaken).map((exam, index) => {
    const score = clampScore(averageScore + exam.delta);

    return {
      id: index + 1,
      name: exam.name,
      date: exam.date,
      score,
      maxScore: 100,
      grade: getGrade(score),
    };
  });

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Тэмүүлэн Бат-Эрдэнэ",
    email: "temuulen.b@university.edu",
    course: "1-р курс",
    averageScore: 92,
    examsTaken: 5,
    trend: "up",
    lastActive: "2 цагийн өмнө",
    examHistory: buildMockExamHistory(92, 5),
  },
  {
    id: 2,
    name: "Номин-Эрдэнэ Ганболд",
    email: "nomin.g@university.edu",
    course: "1-р курс",
    averageScore: 78,
    examsTaken: 5,
    trend: "stable",
    lastActive: "1 өдрийн өмнө",
    examHistory: buildMockExamHistory(78, 5),
  },
  {
    id: 3,
    name: "Хангай Золбоо",
    email: "khangai.z@university.edu",
    course: "2-р курс",
    averageScore: 85,
    examsTaken: 4,
    trend: "up",
    lastActive: "3 цагийн өмнө",
    examHistory: buildMockExamHistory(85, 4),
  },
  {
    id: 4,
    name: "Тулга Баяр",
    email: "tulga.b@university.edu",
    course: "3-р курс",
    averageScore: 65,
    examsTaken: 3,
    trend: "down",
    lastActive: "5 өдрийн өмнө",
    examHistory: buildMockExamHistory(65, 3),
  },
  {
    id: 5,
    name: "Сарнай Мөнхбат",
    email: "sarnai.m@university.edu",
    course: "4-р курс",
    averageScore: 88,
    examsTaken: 5,
    trend: "up",
    lastActive: "Дөнгөж сая",
    examHistory: buildMockExamHistory(88, 5),
  },
  {
    id: 6,
    name: "Энхжин Төрболд",
    email: "enkhjin.t@university.edu",
    course: "3-р курс",
    averageScore: 91,
    examsTaken: 4,
    trend: "stable",
    lastActive: "6 цагийн өмнө",
    examHistory: buildMockExamHistory(91, 4),
  },
  {
    id: 7,
    name: "Анужин Отгонбаяр",
    email: "anujin.o@university.edu",
    course: "4-р курс",
    averageScore: 73,
    examsTaken: 3,
    trend: "down",
    lastActive: "2 өдрийн өмнө",
    examHistory: buildMockExamHistory(73, 3),
  },
  {
    id: 8,
    name: "Билгүүн Содном",
    email: "bilguun.s@university.edu",
    course: "2-р курс",
    averageScore: 95,
    examsTaken: 2,
    trend: "up",
    lastActive: "30 минутын өмнө",
    examHistory: buildMockExamHistory(95, 2),
  },
];

const Page = () => {
  const {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    filteredItems,
  } = useStudentSearch(initialStudents);

  return (
    <div className="p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-xl font-semibold text-foreground">Оюутнууд</h1>
        <p className="text-[14px] text-muted-foreground">
          Оюутны амжилт болон шалгалтын түүхийг харах
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            className="w-64 bg-white"
            placeholder="Оюутны нэрээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* onValueChange эвэнтээр сонгосон утгыг hook рүү дамжуулна */}
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Курс сонгох" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              sideOffset={4}
              className="w-[--radix-select-trigger-width]"
            >
              <SelectGroup>
                <SelectItem value="all">Бүх курс</SelectItem>
                <SelectItem value="1-р курс">1-р курс</SelectItem>
                <SelectItem value="2-р курс">2-р курс</SelectItem>
                <SelectItem value="3-р курс">3-р курс</SelectItem>
                <SelectItem value="4-р курс">4-р курс</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-gray-500 font-medium">
          Нийт {filteredItems.length} оюутан харагдаж байна
        </span>
      </div>

      <div>
        <StudentTable students={filteredItems} />
      </div>
    </div>
  );
};

export default Page;
