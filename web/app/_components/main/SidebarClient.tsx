"use client";
import { Button } from "@/components/ui/button";
import {
  BookCheck,
  BookOpenCheck,
  ChartCandlestick,
  Home,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { icon: Home, label: "Нүүр", href: "/" },
  { icon: BookCheck, label: "Шалгалт", href: "/exams" },
  { icon: BookOpenCheck, label: "Шалгалтанд бэлдэх", href: "/examWarmup" },
  { icon: ChartCandlestick, label: "Дүн", href: "/grades" },
];

type Props = {
  displayName: string;
  isSignedIn: boolean;
};

const SidebarClient = ({ displayName, isSignedIn }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const renderNavItem = ({
    Icon,
    label,
    href,
  }: {
    Icon: typeof Home;
    label: string;
    href: string;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        key={href}
        href={href}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:w-full group-hover:justify-start group-hover:gap-4 group-hover:px-4 group-hover:py-3 ${
          isActive
            ? "bg-[#e6f4f1] text-[#006d77] group-hover:font-semibold"
            : "text-[#0c464c] hover:bg-gray-100"
        }`}
      >
        <Icon size={22} className="shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100">
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside className="group sticky top-0 hidden h-screen shrink-0 border-r border-gray-200 bg-white px-3 py-6 transition-all duration-300 md:flex md:w-20 md:hover:w-64">
      <div className="flex w-full flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006d77] text-base font-semibold text-white transition-all duration-300 hover:cursor-pointer hover:scale-[1.02] group-hover:w-full group-hover:justify-start group-hover:px-4 group-hover:py-3"
            onClick={() => router.push("/")}
          >
            <span className="shrink-0">U</span>
            <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:max-w-40 group-hover:opacity-100">
              UniExam
            </span>
          </div>

          <nav className="flex flex-col items-center gap-2 group-hover:items-stretch">
            {items.map(({ icon: Icon, label, href }) =>
              renderNavItem({ Icon, label, href }),
            )}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3 group-hover:items-stretch">
          {isSignedIn ? (
            <div className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 px-3 group-hover:justify-start group-hover:px-4">
              <ClerkLoading>
                <div className="h-10 w-10 animate-pulse rounded-full border border-gray-100 bg-gray-200" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "w-10 h-10" },
                  }}
                />
              </ClerkLoaded>
              <div className="min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100">
                <p className="truncate text-sm font-medium text-gray-900">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">My account</p>
              </div>
            </div>
          ) : (
            <>
              <SignInButton>
                <Button
                  variant="outline"
                  className="h-12 w-12 rounded-2xl border-gray-200 px-0 transition-all duration-300 group-hover:w-full group-hover:justify-start group-hover:gap-3 group-hover:px-4"
                >
                  <LogIn size={20} />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-30 group-hover:opacity-100">
                    Нэвтрэх
                  </span>
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="h-12 w-12 rounded-2xl bg-[#006d77] px-0 transition-all duration-300 group-hover:w-full group-hover:justify-start group-hover:gap-3 group-hover:px-4">
                  <LogOut size={20} />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-30 group-hover:opacity-100">
                    Бүртгүүлэх
                  </span>
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarClient;
