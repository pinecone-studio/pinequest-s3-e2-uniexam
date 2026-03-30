"use client";

import { useEffect } from "react";
import CourseCard from "./_components/CourseCard";
import StudentTable from "./_components/StudentTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useStudentSearch } from "./_hooks/use-student-search";
import { ExamHistory, Student } from "./type";

/* ================= MOCK ================= */

const examHistoryTemplate = [
  { name: "Явцын шалгалт", date: "2026.03.15", delta: 3 },
  { name: "Сорил 2", date: "2026.03.10", delta: -4 },
  { name: "Сорил 1", date: "2026.02.28", delta: 0 },
];

const clampScore = (score: number) => Math.min(99, Math.max(55, score));

const getGrade = (score: number) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  return "C";
};

const buildMockExamHistory = (
  avg: number,
  count: number,
): ExamHistory[] =>
  examHistoryTemplate.slice(0, count).map((exam, i) => ({
    id: i + 1,
    name: exam.name,
    date: exam.date,
    score: clampScore(avg + exam.delta),
    maxScore: 100,
    grade: getGrade(avg),
  }));

/* ================= STUDENTS ================= */

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Тэмүүлэн",
    email: "t@gmail.com",
    course: "1-р курс",
    major: "Компьютерийн ШУ",
    averageScore: 92,
    examsTaken: 3,
    trend: "up",
    lastActive: "2 цаг",
    examHistory: buildMockExamHistory(92, 3),
  },
  {
    id: 2,
    name: "Хангай",
    email: "h@gmail.com",
    course: "2-р курс",
    major: "Програм хангамж",
    averageScore: 85,
    examsTaken: 3,
    trend: "up",
    lastActive: "1 өдөр",
    examHistory: buildMockExamHistory(85, 3),
  },
  {
    id: 3,
    name: "Сарнай",
    email: "s@gmail.com",
    course: "2-р курс",
    major: "Мэдээллийн систем",
    averageScore: 78,
    examsTaken: 3,
    trend: "stable",
    lastActive: "3 цаг",
    examHistory: buildMockExamHistory(78, 3),
  },
  {
    id: 4,
    name: "Тулга",
    email: "tulga@gmail.com",
    course: "3-р курс",
    major: "Мэдээллийн систем",
    averageScore: 65,
    examsTaken: 3,
    trend: "down",
    lastActive: "5 өдөр",
    examHistory: buildMockExamHistory(65, 3),
  },
  {
    id: 5,
    name: "Энхжин",
    email: "enkhjin@gmail.com",
    course: "3-р курс",
    major: "Програм хангамж",
    averageScore: 91,
    examsTaken: 4,
    trend: "stable",
    lastActive: "6 цаг",
    examHistory: buildMockExamHistory(91, 4),
  },
  {
    id: 6,
    name: "Анужин",
    email: "anujin@gmail.com",
    course: "4-р курс",
    major: "Компьютерийн ШУ",
    averageScore: 73,
    examsTaken: 3,
    trend: "down",
    lastActive: "2 өдөр",
    examHistory: buildMockExamHistory(73, 3),
  },
  {
    id: 7,
    name: "Билгүүн",
    email: "bilguun@gmail.com",
    course: "4-р курс",
    major: "Програм хангамж",
    averageScore: 95,
    examsTaken: 2,
    trend: "up",
    lastActive: "30 минут",
    examHistory: buildMockExamHistory(95, 2),
  },
];

/* ================= COURSES ================= */

const courses = [
  { id: "1-р курс", title: "CS 101", subtitle: "Үндэс" },
  { id: "2-р курс", title: "CS 201", subtitle: "Алгоритм" },
  { id: "3-р курс", title: "CS 301", subtitle: "Мэдээллийн сан" },
  { id: "4-р курс", title: "CS 401", subtitle: "Инженерчлэл" },
];

/* ================= ANALYTICS ================= */

const getAnalytics = (students: Student[]) => {
  const total = students.length;

  const avgScore =
    total === 0
      ? 0
      : Math.round(
          students.reduce((acc, s) => acc + s.averageScore, 0) / total
        );

  const topStudent =
    students.length > 0
      ? students.reduce((prev, current) =>
          prev.averageScore > current.averageScore ? prev : current
        )
      : null;

  const trend = {
    up: students.filter((s) => s.trend === "up").length,
    down: students.filter((s) => s.trend === "down").length,
    stable: students.filter((s) => s.trend === "stable").length,
  };

  return { total, avgScore, topStudent, trend };
};

/* ================= STATS ================= */

function getCourseStats(courseId: string) {
  const students = initialStudents.filter(
    (s) => s.course === courseId
  );

  const total = students.length;

  const progress = students.filter(
    (s) => s.examsTaken > 0
  ).length;

  return { total, progress };
}

/* ================= PAGE ================= */

export default function StudentsPage() {
  const {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    majorFilter,
    setMajorFilter,
    filteredItems,
  } = useStudentSearch(initialStudents);

  const availableMajors = Array.from(
    new Set(
      initialStudents
        .filter((s) =>
          courseFilter === "all" ? true : s.course === courseFilter
        )
        .map((s) => s.major)
    )
  );

  useEffect(() => {
    setMajorFilter("all");
  }, [courseFilter, setMajorFilter]);

  const analytics = getAnalytics(filteredItems);

  return (
    <div className="p-6">

      {/* COURSE CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {courses.map((course) => {
          const stats = getCourseStats(course.id);

          return (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              subtitle={course.subtitle}
              students={stats.total}
              progress={stats.progress}
              total={stats.total}
              active={courseFilter === course.id}
              onClick={(id) => setCourseFilter(id)}
            />
          );
        })}
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white rounded-2xl border">
          <div className="text-sm text-gray-500">Нийт оюутан</div>
          <div className="text-2xl font-bold">{analytics.total}</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border">
          <div className="text-sm text-gray-500">Дундаж оноо</div>
          <div className="text-2xl font-bold text-blue-600">
            {analytics.avgScore}%
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border">
          <div className="text-sm text-gray-500">Шилдэг оюутан</div>
          <div className="text-lg font-semibold">
            {analytics.topStudent?.name}
          </div>
          <div className="text-sm text-gray-500">
            {analytics.topStudent?.averageScore}%
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border">
          <div className="text-sm text-gray-500 mb-2">Ахиц</div>
          <div className="flex gap-3 text-sm">
            <span className="text-green-600">↑ {analytics.trend.up}</span>
            <span className="text-gray-500">→ {analytics.trend.stable}</span>
            <span className="text-red-500">↓ {analytics.trend.down}</span>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Хайх"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Курс" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх курс</SelectItem>
            <SelectItem value="1-р курс">1-р курс</SelectItem>
            <SelectItem value="2-р курс">2-р курс</SelectItem>
            <SelectItem value="3-р курс">3-р курс</SelectItem>
            <SelectItem value="4-р курс">4-р курс</SelectItem>
          </SelectContent>
        </Select>

        <Select value={majorFilter} onValueChange={setMajorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Мэргэжил" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх мэргэжил</SelectItem>
            {availableMajors.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <StudentTable students={filteredItems} />

    </div>
  );
}