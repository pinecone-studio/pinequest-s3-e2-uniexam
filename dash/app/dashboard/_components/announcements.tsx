import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const announcements = [
  {
    initials: "М",
    avatarBg: "bg-[#31A8E0]",
    name: "Мөнхбаяр багш",
    text: "Шалгалтын өмнө бүх оюутнууд системд нэвтэрч, техникийн туршилтаа хийнэ үү. Зум дуудлага 14:00 цагт.",
    time: "2 цагийн өмнө · MATH-402",
  },
  {
    initials: "Б",
    avatarBg: "bg-[#f0a500]",
    name: "Болд багш",
    text: "3-р бүлгийн даалгаврын хугацааг 2 хоногоор сунгалаа. Та нар амжилттай хийнэ гэдэгт итгэлтэй байна.",
    time: "5 цагийн өмнө · ARCH-201",
  },
];

export function Announcements() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Зарлалууд
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              Сүүлийн мэдэгдлүүд
            </p>
          </div>
          <button className="text-[12px] text-[#31A8E0] font-semibold hover:underline">
            + Шинэ зарлал
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3 flex flex-col divide-y divide-[#e8eef4]">
        {announcements.map((a, i) => (
          <div key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <div
              className={`w-9 h-9 rounded-full ${a.avatarBg} text-white flex items-center justify-center text-[13px] font-bold shrink-0`}
            >
              {a.initials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2c3e50]">
                {a.name}
              </p>
              <p className="text-[12px] text-[#8a9bb0] mt-0.5 leading-relaxed">
                {a.text}
              </p>
              <p className="text-[11px] text-[#8a9bb0] mt-1">{a.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
