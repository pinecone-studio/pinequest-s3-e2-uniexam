import { CheckCircle2, ClipboardList, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const grades = [
  {
    icon: CheckCircle2,
    title: "Ирц",
    course: "Хичээл: MATH-402 · Ирц шалгалт",
    score: "Дундаж оноо: 4 / 5",
  },
  {
    icon: ClipboardList,
    title: "Гэрийн даалгавар",
    course: "Хичээл: CS-211 · Гэрийн ажил",
    score: "Дундаж оноо: 8.4 / 10",
  },
  {
    icon: Clock,
    title: "Явцын шалгалт",
    course: "Хичээл: PHYS-301 · Явцын шалгалт",
    score: "Дундаж оноо: 72 / 100",
  },
];

export function LatestGrades() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Сүүлийн үнэлгээ
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              Хуулахгүйгээр сурахыг эрмэлзэж байна
            </p>
          </div>
          <button className="text-[12px] text-[#31A8E0] font-semibold hover:underline">
            + Шинэ
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3 flex flex-col divide-y divide-[#e8eef4]">
        {grades.map((g, i) => (
          <div key={i} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2c3e50] mb-1">
              <g.icon className="w-3.5 h-3.5 text-[#31A8E0]" />
              {g.title}
            </div>
            <p className="text-[11px] text-[#8a9bb0]">{g.course}</p>
            <p className="text-[12px] font-bold text-[#31A8E0] mt-0.5">
              {g.score}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
