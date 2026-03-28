"use client";
import { usePathname } from "next/navigation";

const hideSidebarRoutes = ["/exams"];
// const hideSidebarRoutes = ["/exams", "/login", "/onboarding"];

const ConditionalLayout = ({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) => {
  const pathname = usePathname();
  const hideSidebar = hideSidebarRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (hideSidebar) return <>{children}</>;

  return (
    <div className="flex h-screen">
      {sidebar}
      <main className="flex-1 overflow-auto overflow-x-hidden">{children}</main>
    </div>
  );
};

export default ConditionalLayout;
