"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, Target, Flame } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
}

interface StatCardsProps {
  studyHours?: string;
  questionsAnswered?: number;
  questionsSub?: string;
  accuracy?: number;
  streakDays?: number;
}

export function StatCards({
  studyHours = "18ц",
  questionsAnswered = 156,
  questionsSub = "12 удаагийн дасгал",
  accuracy = 78,
  streakDays = 7,
}: StatCardsProps) {
  const stats: StatItem[] = [
    {
      label: "Хичээллэсэн цаг",
      value: studyHours,
      sub: "Энэ долоо хоногт",
      icon: <Clock className="w-4 h-4 text-slate-400" />,
    },
    {
      label: "Нийт асуулт",
      value: String(questionsAnswered),
      sub: questionsSub,
      icon: <BookOpen className="w-4 h-4 text-slate-400" />,
    },
    {
      label: "Гүйцэтгэл",
      value: `${accuracy}%`,
      sub: "",
      icon: <Target className="w-4 h-4 text-slate-400" />,
      extra: (
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      ),
    },
    {
      label: "Тасралтгүй өдөр",
      value: `${streakDays} өдөр`,
      sub: "Ингээд л үргэлжлүүлээд байгаарай!",
      icon: <Flame className="w-4 h-4 text-orange-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm ring-1 ring-black/5 rounded-xl overflow-hidden"
        >
          <CardContent className="p-3 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase ">
                {stat.label}
              </span>
              <span className="opacity-80">{stat.icon}</span>
            </div>

            <div>
              <div className="text-lg font-bold text-slate-900 leading-none py-1">
                {stat.value}
              </div>

              {stat.extra ? (
                stat.extra
              ) : (
                <div className="text-[10px] text-slate-400 font-medium leading-tight ">
                  {stat.sub}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
