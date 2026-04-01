import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import ConditionalLayout from "./_components/main/ConditionalLayout";
import Sidebar from "./_components/main/Sidebar";
// import Sidebar from "./_components/main/Sidebar";

const inter = Inter({
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "UniExam",
  description: "Let's take an exam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html
        lang="en"
        className={`${inter.className} ${jetbrainsMono.variable} ${robotoMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex w-full">
          {/* <Sidebar /> */}
          <main className="flex-1">
            <ConditionalLayout sidebar={<Sidebar />}>
              {children}
            </ConditionalLayout>
          </main>
          <Toaster position="top-center" expand={false} visibleToasts={1} />
        </body>
      </html>
    </ClerkProvider>
  );
}
