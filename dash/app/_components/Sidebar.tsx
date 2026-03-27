"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Monitor,
  Users,
  BookOpen,
} from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SidebarSkeleton = () => {
  return (
    <aside className="flex h-screen w-68 shrink-0 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-3 py-1">
        <Skeleton className="h-7 w-7 rounded-[10px] bg-slate-200" />
        <Skeleton className="h-4.5 w-11 rounded-sm bg-slate-200" />
      </div>
      <div className="border-t border-gray-200 pt-1" />

      <div className="flex-1 space-y-1 pt-4 text-sm">
        <div className="flex items-center gap-3 rounded-[10px] px-4 py-2">
          <Skeleton className="h-[17px] w-[17px] rounded-sm bg-slate-200" />
          <Skeleton className="h-3.5 w-9 rounded-sm bg-slate-200" />
        </div>
        <div className="flex items-center gap-3 rounded-[10px] px-4 py-2">
          <Skeleton className="h-[18px] w-[18px] rounded-sm bg-slate-200" />
          <Skeleton className="h-[14px] w-14 rounded-sm bg-slate-200" />
        </div>
        <div className="flex items-center gap-3 rounded-[10px] px-4 py-2">
          <Skeleton className="h-[18px] w-[18px] rounded-sm bg-slate-200" />
          <Skeleton className="h-[14px] w-14 rounded-sm bg-slate-200" />
        </div>
        <div className="flex items-center gap-3 rounded-[10px] px-4 py-2">
          <Skeleton className="h-[18px] w-[18px] rounded-sm bg-slate-200" />
          <Skeleton className="h-[14px] w-12 rounded-sm bg-slate-200" />
        </div>
        <div className="flex items-center gap-3 rounded-[10px] px-4 py-2">
          <Skeleton className="h-[18px] w-[18px] rounded-sm bg-slate-200" />
          <Skeleton className="h-[14px] w-[70px] rounded-sm bg-slate-200" />
        </div>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-[14px] w-24 rounded-sm bg-slate-200" />
            <Skeleton className="h-3 w-32 rounded-sm bg-slate-200" />
          </div>
        </div>
      </div>
    </aside>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <SidebarSkeleton />;

  const displayName =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";

  const secondaryLabel = user?.primaryEmailAddress?.emailAddress || "Signed in";

  return (
    <aside className="flex h-screen w-68 shrink-0 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-3  py-1">
        <div className="rounded-[10px] bg-[#2658c4] p-2">
          <BookOpen className="h-3 w-3 text-white" />
        </div>
        <span className="text-[18px] font-bold text-gray-800">LMS</span>
      </div>
      <div className="border-t border-gray-200 pt-1" />

      <nav className="flex-1 space-y-1 pt-4 text-sm">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-[10px] px-4 py-2 transition-colors ${
            pathname === "/"
              ? "bg-[#2658c4] text-white"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <LayoutDashboard size={17} />
          <span className="font-medium ">Нүүр</span>
        </Link>

        <Link
          href="/exams"
          className={`flex items-center gap-3 rounded-[10px] px-4 py-2 transition-colors ${
            pathname.startsWith("/exams")
              ? "bg-[#2658c4] text-white"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <FileText size={18} />
          <span className="font-medium">Шалгалт</span>
        </Link>

        <Link
          href="/grading"
          className={`flex items-center gap-3 rounded-[10px] px-4 py-2 transition-colors ${
            pathname.startsWith("/grading")
              ? "bg-[#2658c4] text-white"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <GraduationCap size={18} />
          <span className="font-medium">Үнэлгээ</span>
        </Link>

        <Link
          href="/monitoring"
          className={`flex items-center gap-3 rounded-[10px] px-4 py-2 transition-colors ${
            pathname.startsWith("/monitoring")
              ? "bg-[#2658c4] text-white"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Monitor size={18} />
          <span className="font-medium">Хяналт</span>
        </Link>

        <Link
          href="/students"
          className={`flex items-center gap-3 rounded-[10px] px-4 py-2 transition-colors ${
            pathname.startsWith("/students")
              ? "bg-[#2658c4] text-white"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Users size={18} />
          <span className="font-medium">Оюутнууд</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-gray-100 pt-4">
        {user ? (
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-10 w-10",
                  },
                }}
              />
            </div>
            <div className="min-w-0 flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-gray-800">
                {displayName}
              </span>
              <span className="truncate text-xs text-gray-400">
                {secondaryLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-2 px-1 py-1 w-full">
            <SignInButton mode="modal">
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button className="flex-1 h-9 text-xs font-medium bg-[#2658c4] text-white hover:bg-blue-700 shadow-sm">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
