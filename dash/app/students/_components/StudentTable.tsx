import { MoreHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react";

// 1. Датаны бүтцийг тодорхойлох (Interface)
interface ExamHistory {
  id: number;
  name: string;
  date: string;
  score: number;
  maxScore: number;
  grade: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  avgScore: number; // Өмнөх avgScore нэртэйгээ ижил байлгав
  exams: number; // Өмнөх exams нэртэйгээ ижил байлгав
  trend: "up" | "down" | "stable";
  lastActive: string;
  examHistory: ExamHistory[];
}

// 2. Монгол хэл дээрх баялаг дата
const students: Student[] = [
  {
    id: 1,
    name: "Алекс Томпсон",
    email: "alex.t@university.edu",
    course: "CS 101",
    avgScore: 92,
    exams: 5,
    trend: "up",
    lastActive: "2 цагийн өмнө",
    examHistory: [
      {
        id: 1,
        name: "Дунд шатны шалгалт",
        date: "2026-03-15",
        score: 95,
        maxScore: 100,
        grade: "A",
      },
      {
        id: 2,
        name: "Эрэмбэлэлтийн сорил",
        date: "2026-03-10",
        score: 88,
        maxScore: 100,
        grade: "B+",
      },
    ],
  },
  {
    id: 2,
    name: "Жордан Мартинез",
    email: "j.martinez@university.edu",
    course: "CS 101",
    avgScore: 78,
    exams: 5,
    trend: "stable",
    lastActive: "1 өдрийн өмнө",
    examHistory: [
      {
        id: 1,
        name: "Дунд шатны шалгалт",
        date: "2026-03-15",
        score: 78,
        maxScore: 100,
        grade: "C+",
      },
    ],
  },
  {
    id: 3,
    name: "Сэм Вилсон",
    email: "s.wilson@university.edu",
    course: "CS 201",
    avgScore: 85,
    exams: 4,
    trend: "up",
    lastActive: "3 цагийн өмнө",
    examHistory: [],
  },
  {
    id: 4,
    name: "Кэйси Браун",
    email: "c.brown@university.edu",
    course: "CS 301",
    avgScore: 65,
    exams: 3,
    trend: "down",
    lastActive: "5 өдрийн өмнө",
    examHistory: [],
  },
  {
    id: 5,
    name: "Морган Дэвис",
    email: "m.davis@university.edu",
    course: "CS 101",
    avgScore: 88,
    exams: 5,
    trend: "up",
    lastActive: "Дөнгөж сая",
    examHistory: [],
  },
  {
    id: 6,
    name: "Райли Жонсон",
    email: "r.johnson@university.edu",
    course: "CS 201",
    avgScore: 91,
    exams: 4,
    trend: "stable",
    lastActive: "6 цагийн өмнө",
    examHistory: [],
  },
  {
    id: 7,
    name: "Тейлор Ли",
    email: "t.lee@university.edu",
    course: "CS 301",
    avgScore: 73,
    exams: 3,
    trend: "down",
    lastActive: "2 өдрийн өмнө",
    examHistory: [],
  },
  {
    id: 8,
    name: "Жэйми Чен",
    email: "j.chen@university.edu",
    course: "CS 401",
    avgScore: 95,
    exams: 2,
    trend: "up",
    lastActive: "30 минутын өмнө",
    examHistory: [],
  },
];

const StudentTable = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-white">
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Оюутан <span className="inline-block ml-1">^</span>
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
            <th className="px-4 py-4 text-sm font-semibold text-gray-900 text-center">
              Ханлага
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Сүүлд идэвхтэй
            </th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {students.map((student) => (
            <tr
              key={student.id}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                  {student.course}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      student.avgScore > 90
                        ? "text-green-600"
                        : student.avgScore < 70
                          ? "text-red-500"
                          : "text-blue-600"
                    }`}
                  >
                    {student.avgScore}%
                  </span>
                  <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${student.avgScore}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {student.exams}
              </td>
              <td className="px-4 py-4 flex justify-center">
                {student.trend === "up" && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {student.trend === "down" && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                {student.trend === "stable" && (
                  <Minus className="w-4 h-4 text-gray-400" />
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {student.lastActive}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
