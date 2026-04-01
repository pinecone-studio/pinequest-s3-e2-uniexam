import type { ReactNode } from "react";
import Link from "next/link";
import { Calendar, Clock, CircleCheck, FileText, Play } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { graphqlRequest } from "@/lib/graphql";
import { toast } from "sonner";
import { useState } from "react";
import { EditExamDialog } from "./EditExamDialog";

export type ExamCardExam = {
  id: string;
  title: string;
  courseId: string;
  courseLabel: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  status: "Төлөвлөгдсөн" | "Авагдаж байгаа" | "Дууссан" | "Драфт";
  rawStartTime: string;
  rawDuration: number;
  image_url?: string | null;
};

const DELETE_EXAM = `#graphql
  mutation DeleteExam($id: String!) {
    deleteExam(id: $id)
  }
`;

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

export const ExamCard = ({
  exam,
  onExamUpdated,
}: {
  exam: ExamCardExam;
  onExamUpdated?: () => void;
}) => {
  const config = statusConfig[exam.status] ?? statusConfig["Драфт"];
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Энэ шалгалтыг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await graphqlRequest(DELETE_EXAM, { id: exam.id });
      toast.success("Шалгалт устгагдлаа");
      onExamUpdated?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Устгахад алдаа гарлаа");
    }
  };

  return (
    <>
      <div className="relative isolate">
        <Link href={`/exams/${exam.id}`} className="block group">
          <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden bg-white transition-shadow group-hover:shadow-md group-hover:border-slate-300">
            <div className="absolute inset-0 z-0">
              {exam.image_url ? (
                <>
                  <img
                    src={exam.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-slate-50" />
              )}
            </div>
            <CardHeader className="relative z-10 flex flex-row justify-between items-start pt-6 px-6 pb-2">
              <Badge
                variant="secondary"
                className={`${config.bg} border-none px-3 py-1 rounded-md flex gap-2 items-center font-medium text-[13px]`}
              >
                {config.icon}
                {config.label}
              </Badge>
            </CardHeader>

            <CardContent className="relative z-10 px-6 pb-6 space-y-5 bg-white/80 backdrop-blur-sm">
              <div>
                <h3 className="font-bold text-[20px] text-slate-900 leading-tight group-hover:text-[#006fee] transition-colors">
                  {exam.title}
                </h3>
                <p className="text-[16px] text-slate-500 mt-2">
                  {exam.courseLabel}
                </p>
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

        <div className="absolute top-5 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900 bg-white shadow-sm border border-slate-200"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="cursor-pointer"
              >
                <Pencil size={14} className="mr-2" /> Засах
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void handleDelete()}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 size={14} className="mr-2" /> Устгах
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <EditExamDialog
          exam={exam}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={() => onExamUpdated?.()}
        />
      </div>
    </>
  );
};
