import { MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const rows = [
  {
    course: "MATH-402 | 3-р бүлэг",
    topic: "Дифференциал тэгшитгэл",
    due: "23 Мар 2025",
    rate: "69%",
    status: "wait" as const,
    statusLabel: "Хүлээж байна",
  },
  {
    course: "PHYS-301 | 2-р бүлэг",
    topic: "Оптик долгионы онол",
    due: "20 Мар 2025",
    rate: "98%",
    status: "grade" as const,
    statusLabel: "Үнэлж байна",
  },
  {
    course: "CS-211 | Шугаман алгоритм",
    topic: "Хоёртын мод",
    due: "13 Мар 2025",
    rate: "100%",
    status: "done" as const,
    statusLabel: "Амжилттай",
  },
];

const statusStyles = {
  wait: "bg-[#31A8E0]/10  text-[#31A8E0]",
  grade: "bg-[#f0a500]/10 text-[#f0a500]",
  done: "bg-[#27ae60]/10  text-[#27ae60]",
};

export function Whatsdue() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Хүлээгдэж буй ажлууд
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              Дуусгах шаардлагатай даалгаврууд
            </p>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="h-8 text-[12px] w-[130px] border-[#e8eef4] bg-[#f0f4f8] text-[#8a9bb0] focus:ring-[#31A8E0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх хичээл</SelectItem>
              <SelectItem value="math">MATH-402</SelectItem>
              <SelectItem value="arch">ARCH-201</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#e8eef4]">
              {["Хичээл | Сэдэв", "Хугацаа", "Илгээлт", "Төлөв", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-[#8a9bb0] uppercase tracking-wide pb-2.5 pr-3"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={
                  i < rows.length - 1 ? "border-b border-[#e8eef4]" : ""
                }
              >
                <td className="py-3 pr-3">
                  <p className="text-[13px] font-medium text-[#2c3e50]">
                    {r.course}
                  </p>
                  <p className="text-[11.5px] text-[#8a9bb0]">{r.topic}</p>
                </td>
                <td className="py-3 pr-3 text-[12px] text-[#8a9bb0] whitespace-nowrap">
                  {r.due}
                </td>
                <td className="py-3 pr-3 text-[12px] text-[#2c3e50]">
                  {r.rate}
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold",
                      statusStyles[r.status],
                    )}
                  >
                    {r.statusLabel}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-[#8a9bb0] hover:text-[#2c3e50] p-0.5">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
