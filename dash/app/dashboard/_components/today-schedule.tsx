import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const slots = [
  {
    time: "МЯГ | 14:30 – 16:00",
    course: "MATH-402",
    topic: "Диффер. тэгшитгэл",
    place: "Онлайн – Zoom",
  },
  {
    time: "МЯГ | 16:30 – 18:00",
    course: "ARCH-201",
    topic: "Хот төлөвлөлт",
    place: "Б-402 танхим",
  },
];

export function TodaySchedule() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
          Өнөөдрийн хуваарь
        </CardTitle>
        <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
          Номоос найдвартай найз байхгүй :)
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3 flex flex-col divide-y divide-[#e8eef4]">
        {slots.map((s, i) => (
          <div key={i} className="py-3 first:pt-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#31A8E0] mb-2">
              <Clock className="w-3 h-3" />
              {s.time}
            </div>
            <Row label="Хичээл:" value={s.course} />
            <Row label="Сэдэв:" value={s.topic} />
            <Row label="Байрлал:" value={s.place} />
          </div>
        ))}

        <div className="pt-3">
          <div className="bg-[#31A8E0]/[0.08] rounded-lg py-2 px-3 text-center text-[11px] text-[#8a9bb0]">
            Өдрийн хичээл дууслаа 🎉
            <br />
            <span className="text-[10px]">Сайхан амраарай!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 mb-0.5">
      <span className="text-[10.5px] text-[#8a9bb0] min-w-[52px]">{label}</span>
      <span className="text-[10.5px] text-[#2c3e50] font-medium">{value}</span>
    </div>
  );
}
