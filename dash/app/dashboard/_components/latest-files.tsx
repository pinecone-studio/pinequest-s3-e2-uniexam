import { MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const files = [
  {
    name: "Лекц12.PDF",
    ext: "PDF",
    extStyle: "bg-red-100 text-red-500",
    course: "MATH-402 | 3-р бүлэг",
    date: "24 Мар 2025",
  },
  {
    name: "Танилцуулга.PPT",
    ext: "PPT",
    extStyle: "bg-[#f0a500]/10 text-[#f0a500]",
    course: "ARCH-201 | Хот төлөвлөлт",
    date: "20 Мар 2025",
  },
  {
    name: "Оноо.XLS",
    ext: "XLS",
    extStyle: "bg-[#27ae60]/10 text-[#27ae60]",
    course: "CS-211 | Алгоритм",
    date: "18 Мар 2025",
  },
];

export function LatestFiles() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Сүүлд байршуулсан файлууд
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              Оюутнуудад байршуулсан материалууд
            </p>
          </div>
          <button className="text-[12px] text-[#31A8E0] font-semibold hover:underline">
            Бүгдийг харах →
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#e8eef4]">
              {["Файл", "Хичээл | Сэдэв", "Огноо", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-[#8a9bb0] uppercase tracking-wide pb-2.5 pr-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((f, i) => (
              <tr
                key={i}
                className={
                  i < files.length - 1 ? "border-b border-[#e8eef4]" : ""
                }
              >
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0",
                        f.extStyle,
                      )}
                    >
                      {f.ext}
                    </div>
                    <span className="text-[13px] font-medium text-[#2c3e50]">
                      {f.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-[12px] text-[#8a9bb0]">
                  {f.course}
                </td>
                <td className="py-3 pr-3 text-[12px] text-[#8a9bb0] whitespace-nowrap">
                  {f.date}
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
