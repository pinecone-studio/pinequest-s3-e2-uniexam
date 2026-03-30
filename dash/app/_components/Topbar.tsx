"use client";

import { Bell, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8eef4] px-7 py-3.5 flex items-center gap-4">
      <h1 className="flex-1 text-[20px] font-bold text-[#2c3e50]">
        Сайн байна уу, <span className="text-[#31A8E0]">Мөнхбаяр багш,</span>
      </h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a9bb0]" />
        <Input
          placeholder="Хайх..."
          className="pl-8 w-[200px] h-9 bg-[#f0f4f8] border-[#e8eef4] text-[13px] text-[#8a9bb0] placeholder:text-[#8a9bb0] focus-visible:ring-[#31A8E0]"
        />
      </div>

      <div className="flex items-center gap-3">
        <IconBtn badge={2} badgeColor="bg-red-500">
          <Bell className="w-[17px] h-[17px]" />
        </IconBtn>
        <IconBtn badge={5} badgeColor="bg-[#f0a500]">
          <Mail className="w-[17px] h-[17px]" />
        </IconBtn>
        <div className="w-9 h-9 rounded-full bg-[#31A8E0] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          М
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  badge,
  badgeColor,
}: {
  children: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="relative w-9 h-9 bg-[#f0f4f8] border-[#e8eef4] text-[#8a9bb0] hover:bg-[#31A8E0] hover:text-white hover:border-[#31A8E0]"
    >
      {children}
      {badge && (
        <span
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${badgeColor} text-white text-[9px] font-bold flex items-center justify-center border-2 border-white`}
        >
          {badge}
        </span>
      )}
    </Button>
  );
}
