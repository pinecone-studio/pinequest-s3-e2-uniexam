"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Activity,
  Users,
  ShieldCheck,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
  {
    href: "/",
    label: "Нүүр",
    icon: LayoutGrid,
    match: (pathname: string) => pathname === "/",
  },
  {
    href: "/exams",
    label: "Шалгалт",
    icon: FileText,
    match: (pathname: string) => pathname.startsWith("/exams"),
    badge: "3",
  },
  {
    href: "/grading",
    label: "Үнэлгээ",
    icon: Activity,
    match: (pathname: string) => pathname.startsWith("/grading"),
  },
  {
    href: "/students",
    label: "Оюутнууд",
    icon: Users,
    match: (pathname: string) => pathname.startsWith("/students"),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const displayName =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Мөнхбаяр багш";

  return (
    <aside className="flex h-screen w-[352px] shrink-0 flex-col overflow-hidden bg-[#0F1923] text-white">
      <div className="px-8 pb-7 pt-9">
        <div className="flex items-center gap-4">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#00B89C] shadow-[0_10px_24px_rgba(0,184,156,0.18)]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-bold leading-none text-white">
              LMS Proctor
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/26">
              Teacher Portal
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/8" />

      <div className="px-8 pb-3 pt-9">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/18">
          Үндсэн цэс
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                active
                  ? "border-[#00B89C]/35 bg-[#00B89C]/12 text-[#00B89C]"
                  : "border-transparent text-white/50 hover:border-white/8 hover:bg-white/4 hover:text-white"
              }`}>
              <div className="flex items-center gap-3.5">
                <Icon className="h-5 w-5" />
                <span className="text-[17px] font-medium">{item.label}</span>
              </div>

              {item.badge ? (
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#F0A500] px-2 text-[12px] font-bold text-[#0F1923]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/8 px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#00B89C] text-base font-bold text-[#0F1923]">
            {user ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-12 w-12",
                  },
                }}
              />
            ) : (
              "МБ"
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[16px] font-medium text-white">
              {displayName}
            </p>
            <p className="truncate text-[13px] text-white/26">Профессор</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
