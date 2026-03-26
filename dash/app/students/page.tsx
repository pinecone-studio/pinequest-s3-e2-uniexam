"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentTable from "./_components/StudentTable";
import { useStudentSearch } from "./_hooks/use-student-search";
import { Student } from "./type";

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
    examHistory: [],
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
    examHistory: [],
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
    examHistory: [],
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
    examHistory: [],
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
    examHistory: [],
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
    examHistory: [],
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
    examHistory: [],
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
    examHistory: [],
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
        <h1 className="text-2xl font-semibold text-foreground">Оюутнууд</h1>
        <p className="mt-1 text-muted-foreground">
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
