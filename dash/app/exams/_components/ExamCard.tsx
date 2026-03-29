import type { ReactNode } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CircleCheck,
  FileText,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ExamCardExam = {
  id: string;
  title: string;
  courseLabel: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  status: "Төлөвлөгдсөн" | "Авагдаж байгаа" | "Дууссан" | "Драфт";
};

const statusConfig: Record<
  ExamCardExam["status"],
  { bg: string; icon: ReactNode; label: string }
> = {
  "Авагдаж байгаа": {
    bg: "bg-green-50 text-green-700",
    icon: <Play size={12} className="fill-green-700" />,
    label: "Авагдаж байгаа",
  },
  Төлөвлөгдсөн: {
    bg: "bg-blue-50 text-blue-600",
    icon: <Calendar size={12} />,
    label: "Төлөвлөгдсөн",
  },
  Дууссан: {
    bg: "bg-slate-50 text-slate-600",
    icon: <CircleCheck size={12} />,
    label: "Дууссан",
  },
  Драфт: {
    bg: "bg-orange-50 text-orange-700",
    icon: <FileText size={12} />,
    label: "Драфт",
  },
};

export const ExamCard = ({ exam }: { exam: ExamCardExam }) => {
  const config = statusConfig[exam.status] ?? statusConfig["Драфт"];

  return (
    <Link href={`/exams/${exam.id}`} className="block group">
      <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white transition-shadow group-hover:shadow-md group-hover:border-slate-300">
        <CardHeader className="flex flex-row justify-between items-start pt-6 px-6 pb-2">
          <Badge
            variant="secondary"
            className={`${config.bg} border-none px-3 py-1 rounded-md flex gap-2 items-center font-medium text-[13px]`}
          >
            {config.icon}
            {config.label}
          </Badge>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-5">
          <div>
            <h3 className="font-bold text-[20px] text-slate-900 leading-tight group-hover:text-[#006fee] transition-colors">
              {exam.title}
            </h3>
            <p className="text-[16px] text-slate-500 mt-2">{exam.courseLabel}</p>
          </div>

          <div className="flex items-center gap-6 text-slate-600">
            <div className="flex items-center gap-2 text-[15px]">
              <Calendar size={18} className="text-slate-700 shrink-0" />{" "}
              {exam.dateLabel}
            </div>
            <div className="flex items-center gap-2 text-[15px]">
              <Clock size={18} className="text-slate-700 shrink-0" />{" "}
              {exam.timeLabel}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          <div className="flex items-center gap-2 text-slate-600 text-[15px]">
            <Clock size={18} className="text-slate-700 shrink-0" />
            {exam.durationLabel}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
