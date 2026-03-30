import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const upcoming = [
  {
    day: "МЯГ",
    time: "14:30",
    dayStyle: "text-[#31A8E0]",
    dotColor: "bg-[#f0a500]",
    name: "Математик анализ IV",
    meta: "MATH-402 · 56 оюутан",
  },
  {
    day: "ЛХА",
    time: "Маргааш",
    dayStyle: "text-[#27ae60]",
    dotColor: "bg-[#31A8E0]",
    name: "Харагдлын физик",
    meta: "PHYS-301 · 38 оюутан",
  },
  {
    day: "БАА",
    time: "10:00",
    dayStyle: "text-[#8a9bb0]",
    dotColor: "bg-[#8a9bb0]",
    name: "Алгоритм дизайн",
    meta: "CS-211 · 72 оюутан",
  },
];

export function UpcomingExams() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
          Удахгүй болох шалгалт
        </CardTitle>
        <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">Хуваарийн дагуу</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3 flex flex-col divide-y divide-[#e8eef4]">
        {upcoming.map((u, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div
              className={cn("text-center min-w-[44px] shrink-0", u.dayStyle)}
            >
              <p className="text-[10px] font-bold uppercase">{u.day}</p>
              <p className="text-[13px] font-bold">{u.time}</p>
            </div>
            <div className={cn("w-2 h-2 rounded-full shrink-0", u.dotColor)} />
            <div>
              <p className="text-[13px] font-semibold text-[#2c3e50]">
                {u.name}
              </p>
              <p className="text-[11px] text-[#8a9bb0] mt-0.5">{u.meta}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
