"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { LayoutDashboard, ClipboardList, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_MAIN = [
  { href: "/", label: "Нүүр", icon: LayoutDashboard },
  { href: "/exams", label: "Шалгалт", icon: ClipboardList },
  { href: "/grading", label: "Үнэлгээ", icon: Star },
  { href: "/students", label: "Оюутнууд", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] shrink-0 bg-[linear-gradient(to_bottom,#24485F_0%,#296181_48%,#31A8E0_100%)] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[22px] border-b border-white/[0.07]">
        <div className="w-[34px] h-[34px] shrink-0 flex items-center justify-center">
          <Image
            src="/logo/Polygon.svg"
            alt="LMS Proctor Logo"
            width={34}
            height={34}
          />
        </div>
        <div>
          <p className="text-white text-[27px] font-semibold leading-tight">
            UniExam
          </p>
        </div>
      </div>

      {/* Nav main */}
      <NavSection label="Үндсэн цэс">
        {NAV_MAIN.map((item) => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </NavSection>

      {/* Footer */}
      <div className="mt-auto px-3 py-4 border-t border-white/[0.07] flex items-center gap-2.5 min-w-0">
        <ClerkLoading>
          <div className="w-[34px] h-[34px] rounded-full bg-white/10 animate-pulse shrink-0" />
        </ClerkLoading>
        <ClerkLoaded>
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {user ? (
              <>
                <div className="shrink-0 [&_.cl-userButtonTrigger]:focus:shadow-none">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-[34px] h-[34px]",
                      },
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-[13px] font-semibold truncate">
                    {user?.fullName?.trim() ||
                      [user?.firstName, user?.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      "Багш"}
                  </p>
                  <p className="text-white/80 text-[11px]">Профессор</p>
                </div>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <div className="w-[34px] h-[34px] rounded-full bg-white/10 flex items-center justify-center text-white text-[13px] font-bold cursor-pointer select-none">
                    Н
                  </div>
                </SignInButton>
                <SignUpButton mode="modal">
                  <div className="w-[34px] h-[34px] rounded-full bg-white/10 flex items-center justify-center text-white text-[13px] font-bold cursor-pointer select-none">
                    Б
                  </div>
                </SignUpButton>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-[13px] font-semibold truncate">
                    Багш
                  </p>
                  <p className="text-white text-[11px]">Нэвтрэх / Бүртгүүлэх</p>
                </div>
              </>
            )}
          </div>
        </ClerkLoaded>
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
          ? "bg-[#31A8E0]/40 text-white shadow-[0_4px_14px_rgba(43,181,200,0.35)]"
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
