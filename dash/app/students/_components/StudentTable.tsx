import { MoreHorizontal, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Student } from "../type";

interface StudentTableProps {
  students: Student[];
}

const StudentTable = ({ students }: StudentTableProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
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
            <th className="px-4 py-4 text-sm font-semibold text-center text-gray-900">
              Ахиц
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Сүүлд
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
                    className={`text-sm font-bold ${student.averageScore > 90 ? "text-green-600" : "text-blue-600"}`}
                  >
                    {student.averageScore}%
                  </span>
                  <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${student.averageScore}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {student.examsTaken} шалгалт
              </td>
              <td className="px-4 py-7 flex justify-center">
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
      {students.length === 0 && (
        <div className="p-10 text-center text-gray-500 text-sm">
          Илэрц олдсонгүй.
        </div>
      )}
    </div>
  );
};

export default StudentTable;
