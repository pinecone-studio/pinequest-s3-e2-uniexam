import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  // Show,
  // SignInButton,
  // SignUpButton,
  // UserButton,
} from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";

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
        <body className="flex min-h-screen bg-[#f0f4f8]">
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex flex-col flex-1 ml-[220px]">
              <Topbar />
              {/* <header className="flex justify-end items-center p-4 gap-4 h-16 bg-blue-50">
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton>
                  <Button>Sign Up</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </header> */}
              {children}
            </main>
          </div>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
