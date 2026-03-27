import { PerformanceCardProps } from "../types";

export const PerformanceCard = ({
  title,
  students,
  score,
}: PerformanceCardProps) => (
  <div className="bg-gray-50 rounded-xl p-4 border">
    <div className="flex justify-between">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500">{students} Оюутанууд</p>
    </div>

    <p className="text-sm text-gray-500 mt-2">Дундаж Оноо</p>

    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full"
        style={{ width: `${score}%` }}
      />
    </div>

    <p className="text-right text-sm mt-1">{score}%</p>
  </div>
);
