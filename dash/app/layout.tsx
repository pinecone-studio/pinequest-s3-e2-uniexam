import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./_components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMS Teacher",
  description: "Grade and Monitor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        suppressHydrationWarning
        lang="en"
        className={`${inter.className} h-full antialiased`}
      >
        <body className="min-h-screen bg-[#f0f4f8]">
          <div className="w-full max-w-[1440px] mx-auto">
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex flex-col flex-1">{children}</main>
            </div>
          </div>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
