"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  { icon: BookCheck, label: "Шалгалт", href: "/examPage" },
  { icon: BookOpenCheck, label: "Шалгалтанд бэлдэх", href: "/examWarmup" },
  { icon: ChartCandlestick, label: "Дүн", href: "/grades" },
];

type Props = {
  displayName: string;
  isSignedIn: boolean;
};

const SidebarClient = ({ displayName, isSignedIn }: Props) => {
  //   const [active, setActive] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <TooltipProvider delayDuration={100}>
      <div className="h-screen w-16 bg-gray-50 py-4 px-4 flex flex-col justify-between items-center">
        <div className="flex flex-col items-center gap-6 w-full">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006d77] text-white text-sm font-semibold hover:cursor-pointer"
            onClick={() => router.push("/")}
          >
            U
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            {items.map(({ icon: Icon, label, href }, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={`h-10 w-10 flex items-center justify-center rounded-md transition-all duration-150
              ${
                pathname === href
                  ? "bg-gray-100 border-l-4 border-[#006d77] text-[#006d77] rounded-l-none"
                  : "text-[#0c464c] hover:bg-gray-100"
              }`}
                  >
                    <Icon size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-700">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {isSignedIn ? (
            <>
              <ClerkLoading>
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse border border-gray-100" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "w-8 h-8" },
                  }}
                />
              </ClerkLoaded>
            </>
          ) : (
            <>
              <SignInButton>
                <Button variant="outline" size="sm" className="rounded-full">
                  <LogIn size={20} />
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="rounded-full">
                  <LogOut size={20} />
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SidebarClient;
