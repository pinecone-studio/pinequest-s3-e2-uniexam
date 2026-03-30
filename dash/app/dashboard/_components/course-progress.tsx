"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const courses = [
  { code: "MATH-402", name: "Математик анализ IV", pct: 63, color: "#31A8E0" },
  {
    code: "ARCH-201",
    name: "Архитектурын үндэс II",
    pct: 45,
    color: "#f0a500",
  },
  { code: "PHYS-301", name: "Харагдлын физик", pct: 33, color: "#31A8E0" },
  { code: "CS-211", name: "Алгоритм дизайн", pct: 25, color: "#27ae60" },
  { code: "CS-305", name: "Өгөгдлийн сан", pct: 20, color: "#f0a500" },
];

const R = 32;
const CIRC = 2 * Math.PI * R; // ≈ 201

function ProgressCircle({ pct, color }: { pct: number; color: string }) {
  const offset = CIRC - (pct / 100) * CIRC;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
      <circle
        cx="40"
        cy="40"
        r={R}
        fill="none"
        stroke="#e8eef4"
        strokeWidth="6"
      />
      <circle
        cx="40"
        cy="40"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

export function CourseProgress() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-[#e8eef4]">
      <CardHeader className="pb-0 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[14px] font-bold text-[#2c3e50]">
              Хичээлийн явц
            </CardTitle>
            <p className="text-[11.5px] text-[#8a9bb0] mt-0.5">
              2025 оны хавар • Долоо хоног 12
            </p>
          </div>
          <button className="text-[12px] text-[#31A8E0] font-semibold hover:underline">
            Бүгдийг харах →
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <NavArrow direction="left" />
          {courses.map((c) => (
            <div key={c.code} className="text-center shrink-0">
              <div className="relative w-20 h-20">
                <ProgressCircle pct={c.pct} color={c.color} />
                <span className="absolute inset-0 flex items-center justify-center text-[14px] font-extrabold text-[#2c3e50]">
                  {c.pct}%
                </span>
              </div>
              <p className="text-[12px] font-semibold text-[#2c3e50] mt-1.5">
                {c.code}
              </p>
              <p className="text-[10.5px] text-[#8a9bb0] max-w-[80px] leading-tight">
                {c.name}
              </p>
            </div>
          ))}
          <NavArrow direction="right" />
        </div>
      </CardContent>
    </Card>
  );
}

function NavArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <button className="w-[30px] h-[30px] rounded-full border border-[#e8eef4] bg-white flex items-center justify-center text-[#8a9bb0] shrink-0 hover:bg-[#31A8E0] hover:text-white hover:border-[#31A8E0] transition-all">
      {direction === "left" ? (
        <ChevronLeft className="w-3 h-3" />
      ) : (
        <ChevronRight className="w-3 h-3" />
      )}
    </button>
  );
}
