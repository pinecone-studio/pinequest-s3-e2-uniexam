"use client";
import { usePathname } from "next/navigation";

const hideSidebarRoutes = ["/exam", "/examPage"];
const authRoutes = ["/sign-in", "/sign-up"];

const ConditionalLayout = ({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) => {
  const pathname = usePathname();
  const hideSidebar = hideSidebarRoutes.some((route) =>
    route === "/exam"
      ? pathname === route
      : pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (hideSidebar || isAuthRoute) return <>{children}</>;

  return (
    <div className="flex h-screen">
      {sidebar}
      <main className="flex-1 overflow-auto overflow-x-hidden">{children}</main>
    </div>
  );
};

export default ConditionalLayout;
