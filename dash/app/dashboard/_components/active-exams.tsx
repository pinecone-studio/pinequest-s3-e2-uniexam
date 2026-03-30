import { Monitor, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const exams = [
  {
    icon: Monitor,
    iconBg: "bg-[#31A8E0]/10",
    iconColor: "text-[#31A8E0]",
    name: "Архитектурын үндэс II",
    meta: "ARCH-201 · Б-402 · Онлайн",
    students: 42,
    violations: 3,
    violationsColor: "text-red-500",
    btnBg: "bg-[#31A8E0] hover:bg-[#1fa8bb]",
  },
  {
    icon: Info,
    iconBg: "bg-[#27ae60]/10",
    iconColor: "text-[#27ae60]",
    name: "Өгөгдлийн сангийн удирдлага",
    meta: "CS-305 · Онлайн · 119 оюутан",
    students: 119,
    violations: 0,
    violationsColor: "text-[#27ae60]",
    btnBg: "bg-[#27ae60] hover:bg-[#219a52]",
  },
];

export function ActiveExams() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Явагдаж буй шалгалтууд
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              2 шалгалт одоо явагдаж байна
            </p>
          </div>
          <button className="text-[12px] text-[#31A8E0] font-semibold hover:underline">
            Бүгдийг харах →
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 flex flex-col gap-3">
        {exams.map((e) => (
          <div
            key={e.name}
            className="flex items-center gap-3 border border-[#e8eef4] rounded-xl px-4 py-3"
          >
            <div
              className={`w-[38px] h-[38px] rounded-[9px] ${e.iconBg} ${e.iconColor} flex items-center justify-center shrink-0`}
            >
              <e.icon className="w-[18px] h-[18px]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#2c3e50] truncate">
                {e.name}
              </p>
              <p className="text-[11px] text-[#8a9bb0] mt-0.5">{e.meta}</p>
            </div>

            <div className="flex gap-4 shrink-0 text-right">
              <div>
                <p className="text-[13px] font-bold text-[#2c3e50]">
                  {e.students}
                </p>
                <p className="text-[10px] text-[#8a9bb0]">Оюутан</p>
              </div>
              <div>
                <p className={`text-[13px] font-bold ${e.violationsColor}`}>
                  {e.violations}
                </p>
                <p className="text-[10px] text-[#8a9bb0]">Зөрчил</p>
              </div>
            </div>
            <Link href="/monitoring">
              <Button
                size="sm"
                className={`${e.btnBg} text-white text-[12px] font-semibold ml-2 whitespace-nowrap rounded-lg h-8 px-3 border-0`}
              >
                Хяналт руу орох →
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
