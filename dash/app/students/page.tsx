"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import StudentTable from "./_components/StudentTable";
import AdvancedFilter from "./_components/AdvancedFilter";
import { Input } from "@/components/ui/input";

import { useStudentSearch } from "./_hooks/use-student-search";
import { ExamHistory, Student } from "./type";

/* ================= MOCK ================= */

const examHistoryTemplate = [
  { name: "Явцын шалгалт", date: "2026.03.15", delta: 3 },
  { name: "Сорил 2", date: "2026.03.10", delta: -4 },
  { name: "Сорил 1", date: "2026.02.28", delta: 0 },
];

const clampScore = (score: number) => Math.min(99, Math.max(55, score));

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
    grade: "B",
  }));

/* ================= STUDENTS ================= */
// 👉 Чиний бүх student data unchanged
const initialStudents: Student[] = [  {
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
  // ===== 1-р курс нэмэлт =====
{
  id: 8,
  name: "Бат",
  email: "bat@gmail.com",
  course: "1-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 88,
  examsTaken: 3,
  trend: "up",
  lastActive: "1 цаг",
  examHistory: buildMockExamHistory(88, 3),
},
{
  id: 9,
  name: "Мөнх",
  email: "munkh@gmail.com",
  course: "1-р курс",
  major: "Програм хангамж",
  averageScore: 76,
  examsTaken: 2,
  trend: "stable",
  lastActive: "3 цаг",
  examHistory: buildMockExamHistory(76, 2),
},
{
  id: 10,
  name: "Отгон",
  email: "otgon@gmail.com",
  course: "1-р курс",
  major: "Мэдээллийн систем",
  averageScore: 81,
  examsTaken: 3,
  trend: "up",
  lastActive: "5 цаг",
  examHistory: buildMockExamHistory(81, 3),
},
{
  id: 11,
  name: "Сүх",
  email: "sukh@gmail.com",
  course: "1-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 69,
  examsTaken: 2,
  trend: "down",
  lastActive: "1 өдөр",
  examHistory: buildMockExamHistory(69, 2),
},
{
  id: 12,
  name: "Дөлгөөн",
  email: "dolgion@gmail.com",
  course: "1-р курс",
  major: "Програм хангамж",
  averageScore: 90,
  examsTaken: 4,
  trend: "up",
  lastActive: "30 минут",
  examHistory: buildMockExamHistory(90, 4),
},
{
  id: 28,
  name: "Баатар",
  email: "baatar@gmail.com",
  course: "1-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 62,
  examsTaken: 3,
  trend: "down",
  lastActive: "2 өдөр",
  examHistory: buildMockExamHistory(62, 3),
},
{
  id: 29,
  name: "Сод",
  email: "sod@gmail.com",
  course: "1-р курс",
  major: "Програм хангамж",
  averageScore: 68,
  examsTaken: 2,
  trend: "down",
  lastActive: "1 өдөр",
  examHistory: buildMockExamHistory(68, 2),
},
{
  id: 30,
  name: "Гэрэл",
  email: "gerel@gmail.com",
  course: "1-р курс",
  major: "Мэдээллийн систем",
  averageScore: 0,
  examsTaken: 0,
  trend: "stable",
  lastActive: "—",
  examHistory: [],
},

// ===== 2-р курс нэмэлт =====
{
  id: 13,
  name: "Төгс",
  email: "tugs@gmail.com",
  course: "2-р курс",
  major: "Програм хангамж",
  averageScore: 84,
  examsTaken: 3,
  trend: "up",
  lastActive: "2 цаг",
  examHistory: buildMockExamHistory(84, 3),
},
{
  id: 14,
  name: "Эрдэнэ",
  email: "erdene@gmail.com",
  course: "2-р курс",
  major: "Мэдээллийн систем",
  averageScore: 77,
  examsTaken: 3,
  trend: "stable",
  lastActive: "4 цаг",
  examHistory: buildMockExamHistory(77, 3),
},
{
  id: 15,
  name: "Билэг",
  email: "bileg@gmail.com",
  course: "2-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 92,
  examsTaken: 4,
  trend: "up",
  lastActive: "1 цаг",
  examHistory: buildMockExamHistory(92, 4),
},
{
  id: 16,
  name: "Нара",
  email: "nara@gmail.com",
  course: "2-р курс",
  major: "Програм хангамж",
  averageScore: 70,
  examsTaken: 2,
  trend: "down",
  lastActive: "1 өдөр",
  examHistory: buildMockExamHistory(70, 2),
},
{
  id: 17,
  name: "Солонго",
  email: "solongo@gmail.com",
  course: "2-р курс",
  major: "Мэдээллийн систем",
  averageScore: 86,
  examsTaken: 3,
  trend: "up",
  lastActive: "3 цаг",
  examHistory: buildMockExamHistory(86, 3),
},{
  id: 31,
  name: "Ням",
  email: "nyam@gmail.com",
  course: "2-р курс",
  major: "Програм хангамж",
  averageScore: 65,
  examsTaken: 3,
  trend: "down",
  lastActive: "3 өдөр",
  examHistory: buildMockExamHistory(65, 3),
},
{
  id: 32,
  name: "Төгөлдөр",
  email: "tuguldur@gmail.com",
  course: "2-р курс",
  major: "Мэдээллийн систем",
  averageScore: 60,
  examsTaken: 2,
  trend: "down",
  lastActive: "2 өдөр",
  examHistory: buildMockExamHistory(60, 2),
},
{
  id: 33,
  name: "Бямба",
  email: "byamba@gmail.com",
  course: "2-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 0,
  examsTaken: 0,
  trend: "stable",
  lastActive: "—",
  examHistory: [],
},

// ===== 3-р курс нэмэлт =====
{
  id: 18,
  name: "Ган",
  email: "gan@gmail.com",
  course: "3-р курс",
  major: "Програм хангамж",
  averageScore: 89,
  examsTaken: 3,
  trend: "up",
  lastActive: "2 цаг",
  examHistory: buildMockExamHistory(89, 3),
},
{
  id: 19,
  name: "Болд",
  email: "bold@gmail.com",
  course: "3-р курс",
  major: "Мэдээллийн систем",
  averageScore: 74,
  examsTaken: 2,
  trend: "stable",
  lastActive: "6 цаг",
  examHistory: buildMockExamHistory(74, 2),
},
{
  id: 20,
  name: "Сэргэлэн",
  email: "sergelen@gmail.com",
  course: "3-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 93,
  examsTaken: 4,
  trend: "up",
  lastActive: "1 цаг",
  examHistory: buildMockExamHistory(93, 4),
},
{
  id: 21,
  name: "Тэмка",
  email: "temka@gmail.com",
  course: "3-р курс",
  major: "Програм хангамж",
  averageScore: 68,
  examsTaken: 2,
  trend: "down",
  lastActive: "1 өдөр",
  examHistory: buildMockExamHistory(68, 2),
},
{
  id: 34,
  name: "Гантулга",
  email: "gantulga@gmail.com",
  course: "3-р курс",
  major: "Програм хангамж",
  averageScore: 67,
  examsTaken: 3,
  trend: "down",
  lastActive: "1 өдөр",
  examHistory: buildMockExamHistory(67, 3),
},
{
  id: 35,
  name: "Оргил",
  email: "orgil@gmail.com",
  course: "3-р курс",
  major: "Мэдээллийн систем",
  averageScore: 63,
  examsTaken: 2,
  trend: "down",
  lastActive: "2 өдөр",
  examHistory: buildMockExamHistory(63, 2),
},
{
  id: 36,
  name: "Заяа",
  email: "zaya@gmail.com",
  course: "3-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 0,
  examsTaken: 0,
  trend: "stable",
  lastActive: "—",
  examHistory: [],
},
{
  id: 22,
  name: "Ану",
  email: "anu@gmail.com",
  course: "3-р курс",
  major: "Мэдээллийн систем",
  averageScore: 87,
  examsTaken: 3,
  trend: "up",
  lastActive: "4 цаг",
  examHistory: buildMockExamHistory(87, 3),
},

// ===== 4-р курс нэмэлт =====
{
  id: 23,
  name: "Очир",
  email: "ochir@gmail.com",
  course: "4-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 91,
  examsTaken: 4,
  trend: "up",
  lastActive: "1 цаг",
  examHistory: buildMockExamHistory(91, 4),
},
{
  id: 24,
  name: "Золбоо",
  email: "zolboo@gmail.com",
  course: "4-р курс",
  major: "Програм хангамж",
  averageScore: 79,
  examsTaken: 3,
  trend: "stable",
  lastActive: "3 цаг",
  examHistory: buildMockExamHistory(79, 3),
},
{
  id: 37,
  name: "Оч",
  email: "och@gmail.com",
  course: "4-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 66,
  examsTaken: 3,
  trend: "down",
  lastActive: "3 өдөр",
  examHistory: buildMockExamHistory(66, 3),
},
{
  id: 38,
  name: "Тэмүүжин",
  email: "temuujin@gmail.com",
  course: "4-р курс",
  major: "Програм хангамж",
  averageScore: 61,
  examsTaken: 2,
  trend: "down",
  lastActive: "2 өдөр",
  examHistory: buildMockExamHistory(61, 2),
},
{
  id: 39,
  name: "Сараа",
  email: "saraa@gmail.com",
  course: "4-р курс",
  major: "Мэдээллийн систем",
  averageScore: 0,
  examsTaken: 0,
  trend: "stable",
  lastActive: "—",
  examHistory: [],
},
{
  id: 25,
  name: "Марал",
  email: "maral@gmail.com",
  course: "4-р курс",
  major: "Мэдээллийн систем",
  averageScore: 85,
  examsTaken: 3,
  trend: "up",
  lastActive: "2 цаг",
  examHistory: buildMockExamHistory(85, 3),
},
{
  id: 26,
  name: "Тэнгис",
  email: "tengis@gmail.com",
  course: "4-р курс",
  major: "Компьютерийн ШУ",
  averageScore: 72,
  examsTaken: 2,
  trend: "down",
  lastActive: "1 өдөр",
  examHistory: buildMockExamHistory(72, 2),
},
{
  id: 27,
  name: "Энхбат",
  email: "enkhbat@gmail.com",
  course: "4-р курс",
  major: "Програм хангамж",
  averageScore: 94,
  examsTaken: 4,
  trend: "up",
  lastActive: "30 минут",
  examHistory: buildMockExamHistory(94, 4),
},];

/* ================= ANALYTICS ================= */

const getAnalytics = (students: Student[]) => {
  const total = students.length;

  const avgScore =
    total === 0
      ? 0
      : Math.round(
          students.reduce((a, s) => a + s.averageScore, 0) / total
        );

  const topStudent =
    students.length > 0
      ? students.reduce((p, c) =>
          p.averageScore > c.averageScore ? p : c
        )
      : null;

  return { total, avgScore, topStudent };
};

const getInsight = (students: Student[]) => {
  const missing = students.filter((s) => s.examsTaken === 0).length;
  const low = students.filter((s) => s.averageScore < 60).length;

  if (missing > 0)
    return `⚠ ${missing} оюутан шалгалт өгөөгүй`;
  if (low > 0)
    return `⚠ ${low} оюутан муу дүнтэй`;

  return "✅ Хэвийн";
};

/* ================= PAGE ================= */

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    majorFilter,
    setMajorFilter,
    filteredItems,
  } = useStudentSearch(initialStudents);

  const [open, setOpen] = useState(false);

  const analytics = getAnalytics(filteredItems);

  /* 🔥 URL → STATE */
  useEffect(() => {
    const course = searchParams.get("course");
    const major = searchParams.get("major");

    if (course) setCourseFilter(course.split(","));
    if (major) setMajorFilter(major.split(","));
  }, []);

  /* 🔥 STATE → URL */
  useEffect(() => {
    const params = new URLSearchParams();

    if (courseFilter.length)
      params.set("course", courseFilter.join(","));

    if (majorFilter.length)
      params.set("major", majorFilter.join(","));

    router.replace(`?${params.toString()}`);
  }, [courseFilter, majorFilter, router]);

  /* 🔥 PRESET */
  const savePreset = () => {
    localStorage.setItem(
      "student-filter",
      JSON.stringify({ courseFilter, majorFilter })
    );
  };

  const loadPreset = () => {
    const saved = localStorage.getItem("student-filter");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    setCourseFilter(parsed.courseFilter || []);
    setMajorFilter(parsed.majorFilter || []);
  };

  /* 🔥 dynamic majors */
  const availableMajors = Array.from(
    new Set(
      initialStudents
        .filter((s) =>
          courseFilter.length === 0
            ? true
            : courseFilter.includes(s.course)
        )
        .map((s) => s.major)
    )
  );

  useEffect(() => {
    setMajorFilter([]);
  }, [courseFilter]);

  return (
    <div className="p-6 space-y-6">

      {/* ANALYTICS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl">
          Нийт: {analytics.total}
        </div>
        <div className="p-4 border rounded-xl">
          Дундаж: {analytics.avgScore}%
        </div>
        <div className="p-4 border rounded-xl">
          Шилдэг: {analytics.topStudent?.name}
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 flex-wrap items-center">
        <Input
          className="w-56"
          placeholder="Оюутан хайх..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button onClick={() => setOpen(true)} className="border px-3 py-1 rounded">
          Filter
        </button>

        <button onClick={savePreset} className="px-3 py-1 bg-gray-100 rounded">
          Save
        </button>

        <button onClick={loadPreset} className="px-3 py-1 bg-gray-100 rounded">
          Load
        </button>
      </div>

      {/* 🔥 FILTER CHIPS + ANIMATION */}
      <AnimatePresence>
        {(courseFilter.length > 0 || majorFilter.length > 0) && (
          <motion.div
            layout
            className="flex flex-wrap gap-2"
          >
            {courseFilter.map((c) => (
              <motion.div
                key={c}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="px-3 py-1 bg-blue-100 rounded-full text-sm"
              >
                {c}
                <button onClick={() =>
                  setCourseFilter(prev => prev.filter(x => x !== c))
                }> × </button>
              </motion.div>
            ))}

            {majorFilter.map((m) => (
              <motion.div
                key={m}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="px-3 py-1 bg-green-100 rounded-full text-sm"
              >
                {m}
                <button onClick={() =>
                  setMajorFilter(prev => prev.filter(x => x !== m))
                }> × </button>
              </motion.div>
            ))}

            <button
              onClick={() => {
                setCourseFilter([]);
                setMajorFilter([]);
              }}
              className="px-3 py-1 bg-red-100 rounded-full text-sm"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSIGHT */}
      <div className="p-3 bg-blue-50 border rounded text-sm">
        {getInsight(filteredItems)}
      </div>

      {/* TABLE */}
      <StudentTable students={filteredItems} />

      {/* MODAL */}
      <AdvancedFilter
        open={open}
        setOpen={setOpen}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        majorFilter={majorFilter}
        setMajorFilter={setMajorFilter}
        majors={availableMajors}
      />
    </div>
  );
}