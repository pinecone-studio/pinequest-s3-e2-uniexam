import { CalendarDays } from "lucide-react";

type ScheduleItem = {
  day: string;
  title: string;
  time: string;
};

type Props = {
  items?: ScheduleItem[];
};

const defaultItems: ScheduleItem[] = [
  { day: "Даваа", title: "Системийн шинжилгээ", time: "09:30" },
  { day: "Мягмар", title: "Алгоритм дизайн", time: "11:30" },
  { day: "Лхагва", title: "Сүлжээний аюулгүй байдал", time: "15:30" },
];

export function WeeklyScheduleCard({ items = defaultItems }: Props) {
  return (
    <div className="rounded-[24px] bg-[#0f4c93] p-4 text-white shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <CalendarDays size={17} />
        </div>
        <h3 className="text-lg font-semibold">Энэ 7 хоногийн хуваарь</h3>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.day}-${item.title}`}
            className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
            <div className="pr-4">
              <p className="text-sm text-white/65">{item.day}</p>
              <p className="mt-1 text-sm font-medium">{item.title}</p>
            </div>

            <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
