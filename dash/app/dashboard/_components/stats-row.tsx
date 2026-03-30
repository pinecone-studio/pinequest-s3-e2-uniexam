import { Clock, AlertTriangle, Users } from "lucide-react";

const stats = [
  {
    icon: Clock,
    iconBg: "bg-[#31A8E0]/10",
    iconColor: "text-[#31A8E0]",
    topBorder: "bg-[#31A8E0]",
    num: "03",
    label: "Идэвхтэй шалгалт",
    badge: "Идэвхтэй",
    badgeBg: "bg-[#31A8E0]/10",
    badgeColor: "text-[#31A8E0]",
  },
  {
    icon: AlertTriangle,
    iconBg: "bg-[#f0a500]/10",
    iconColor: "text-[#f0a500]",
    topBorder: "bg-[#f0a500]",
    num: "12",
    label: "Анхааруулга",
    badge: "+15",
    badgeBg: "bg-[#f0a500]/10",
    badgeColor: "text-[#f0a500]",
  },
  {
    icon: Users,
    iconBg: "bg-[#27ae60]/10",
    iconColor: "text-[#27ae60]",
    topBorder: "bg-[#27ae60]",
    num: "48",
    label: "Шалгалт өгч буй",
    badge: "+3",
    badgeBg: "bg-[#27ae60]/10",
    badgeColor: "text-[#27ae60]",
  },
];

export function StatsRow() {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="relative bg-white rounded-xl p-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* top accent bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] ${s.topBorder}`}
          />

          <div
            className={`w-9 h-9 rounded-[9px] ${s.iconBg} ${s.iconColor} flex items-center justify-center mb-3`}
          >
            <s.icon className="w-[18px] h-[18px]" />
          </div>

          <span
            className={`absolute top-3.5 right-3.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${s.badgeBg} ${s.badgeColor}`}
          >
            {s.badge}
          </span>

          <p className="text-[28px] font-extrabold text-[#2c3e50] leading-none">
            {s.num}
          </p>
          <p className="text-[12px] text-[#8a9bb0] mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
