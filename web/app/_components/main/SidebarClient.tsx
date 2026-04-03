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
import Image from "next/image";

const items = [
  { icon: Home, label: "Нүүр", href: "/dashboard" },
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
        className={`flex h-12 w-full items-center rounded-2xl px-1 transition-colors duration-200 ${
          isActive
            ? "bg-[#e6f4f1] text-[#006d77]"
            : "text-[#0c464c] hover:bg-gray-100"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          <Icon size={22} className="shrink-0" />
        </span>
        <span
          className={`ml-3 whitespace-nowrap text-sm ${
            isActive ? "font-semibold" : ""
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white px-3 py-6 md:flex">
      <div className="flex w-full flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div
            className="flex h-12 items-center"
            onClick={() => router.push("/")}
          >
            <div className="flex items-center ml-3.5 justify-center">
              <span className="w-[34px] h-[34px] shrink-0 flex items-center justify-center">
                <Image src="/Icon.svg" alt="icon" width={34} height={34} />
              </span>
            </div>
            <span className="ml-3 whitespace-nowrap text-base font-semibold text-[#0c464c]">
              UniExam
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            {items.map(({ icon: Icon, label, href }) =>
              renderNavItem({ Icon, label, href }),
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          {isSignedIn ? (
            <div className="flex h-12 w-full items-center rounded-2xl px-1">
              <ClerkLoading>
                <div className="ml-0.5 h-10 w-10 animate-pulse rounded-full border border-gray-100 bg-gray-200" />
              </ClerkLoading>
              <ClerkLoaded>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <UserButton
                    appearance={{
                      elements: { userButtonAvatarBox: "w-10 h-10" },
                    }}
                  />
                </div>
              </ClerkLoaded>
              <div className="ml-3 min-w-0">
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
                  className="h-12 w-full justify-start rounded-2xl border-gray-200 px-1"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <LogIn size={20} />
                  </span>
                  <span className="ml-3 whitespace-nowrap">Нэвтрэх</span>
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="h-12 w-full justify-start rounded-2xl bg-[#006d77] px-1">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <LogOut size={20} />
                  </span>
                  <span className="ml-3 whitespace-nowrap">Бүртгүүлэх</span>
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
