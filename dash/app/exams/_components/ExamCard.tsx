"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { graphqlRequest } from "@/lib/graphql";
import { toast } from "sonner";
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

const statusStyle: Record<ExamCardExam["status"], string> = {
  "Авагдаж байгаа": "bg-green-50 text-green-700",
  Төлөвлөгдсөн: "bg-blue-50 text-blue-600",
  Дууссан: "bg-gray-100 text-gray-500",
  Драфт: "bg-orange-50 text-orange-600",
};

export function ExamCard({
  exam,
  onExamUpdated,
}: {
  exam: ExamCardExam;
  onExamUpdated?: () => void;
}) {
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
    <div className="relative group font-sans">
      <Link href={`/exams/${exam.id}`} className="block">
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 transition-colors hover:border-gray-300 hover:bg-gray-50/50">
          {/* Status */}
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${statusStyle[exam.status]}`}
          >
            {exam.status}
          </span>

          {/* Title + course */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors truncate">
              {exam.title}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5 truncate">
              {exam.courseLabel}
            </p>
          </div>

          {/* Cover image (small, if present) */}
          {exam.image_url ? (
            <img
              src={exam.image_url}
              alt={exam.image_url}
              className="w-full h-28 object-cover rounded-md"
            />
          ) : (
            <img
              src={
                "https://www.kidicious.com/wp-content/uploads/2015/12/exams.png"
              }
              alt="fallback"
              className="w-full h-28 object-cover rounded-md"
            />
          )}

          {/* Meta */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {exam.dateLabel}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {exam.timeLabel}
              </span>
            </div>
            <span className="text-gray-500 font-medium">
              {exam.durationLabel}
            </span>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-white border border-gray-200 text-gray-400 hover:text-gray-700 shadow-sm"
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setEditOpen(true)}
              className="cursor-pointer text-sm"
            >
              <Pencil size={13} className="mr-2" /> Засах
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void handleDelete()}
              className="cursor-pointer text-sm text-red-600 focus:text-red-700 focus:bg-red-50"
            >
              <Trash2 size={13} className="mr-2" /> Устгах
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
  );
}
