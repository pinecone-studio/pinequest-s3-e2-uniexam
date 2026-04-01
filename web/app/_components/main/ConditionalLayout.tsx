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
    route === "/exam" ? pathname === route : pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const useConstrainedWidth = !hideSidebar;

  if (hideSidebar || isAuthRoute) {
    return (
      <div className={useConstrainedWidth ? " w-full max-w-360" : "w-full"}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={
        useConstrainedWidth
          ? " flex h-screen w-full max-w-360"
          : "flex h-screen w-full"
      }
    >
      {sidebar}
      <main className="flex-1 overflow-auto overflow-x-hidden">{children}</main>
    </div>
  );
};

export default ConditionalLayout;
