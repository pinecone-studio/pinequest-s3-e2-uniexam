"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Star,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_MAIN = [
  { href: "/", label: "Нүүр", icon: LayoutDashboard },
  { href: "/exams", label: "Шалгалт", icon: ClipboardList },
  { href: "/grading", label: "Үнэлгээ", icon: Star },
  { href: "/students", label: "Оюутнууд", icon: Users },
];

const NAV_REPORT = [
  { href: "/performance", label: "Гүйцэтгэл", icon: TrendingUp },
  { href: "/statistics", label: "Статистик", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-[220px] bg-[linear-gradient(to_bottom,#24485F_0%,#296181_48%,#31A8E0_100%)] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[22px] border-b border-white/[0.07]">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#31A8E0] flex items-center justify-center text-white font-bold text-base shrink-0">
          L
        </div>
        <div>
          <p className="text-white text-[15px] font-semibold leading-tight">
            LMS Proctor
          </p>
          <p className="text-[#8a9bb0] text-[10px] font-normal uppercase tracking-widest">
            Teacher Portal
          </p>
        </div>
      </div>

      {/* Nav main */}
      <NavSection label="Үндсэн цэс">
        {NAV_MAIN.map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </NavSection>

      {/* Nav report */}
      <NavSection label="Тайлан">
        {NAV_REPORT.map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </NavSection>

      {/* Footer */}
      <div className="mt-auto px-3 py-4 border-t border-white/[0.07] flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-full bg-[#2bb5c8] flex items-center justify-center text-white text-sm font-bold shrink-0">
          М
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold">Мөнхбаяр</p>
          <p className="text-[#8a9bb0] text-[11px]">Профессор</p>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="px-4 mb-1 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
        {label}
      </p>
      <div className="px-2 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-[11px] px-4 py-[10px] rounded-lg text-[13.5px] font-medium transition-all duration-150",
        active
          ? "bg-white text-[#31A8E0] shadow-[0_4px_14px_rgba(43,181,200,0.35)]"
          : "text-white/55 hover:bg-white/[0.07] hover:text-white",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-[#f0a500] text-white text-[10px] font-bold rounded-full px-[7px] py-px leading-4">
          {badge}
        </span>
      )}
    </Link>
  );
}
