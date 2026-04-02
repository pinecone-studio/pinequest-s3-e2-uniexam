"use client";

import {
  AlertTriangle,
  Camera,
  Clock,
  Keyboard,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { canStartExam, type UpcomingExamCard } from "@/lib/upcoming-exams";

interface ExamStartWarningDialogProps {
  open: boolean;
  exam: UpcomingExamCard | null;
  currentTime: number;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}

export function ExamStartWarningDialog({
  open,
  exam,
  currentTime,
  onOpenChange,
  onStart,
}: ExamStartWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogHeader className="gap-1 border-b border-slate-100 px-7 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <AlertTriangle className="h-5 w-5 text-[#d97706]" />
            Шалгалтын өмнөх сануулга
          </DialogTitle>
          <DialogDescription className="pl-7 text-xs text-slate-500">
            Шалгалтаа эхлүүлэхээс өмнө дараах мэдээлэлтэй танилцана уу.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 py-4">
          {exam ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-medium text-[#006d77]">
                {exam.subject}
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                {exam.title}
              </h3>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Tab, focus, гарах оролдлогууд хянагдана
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Шалгалтын үеэр tab солих, цонхны focus алдах, window blur,
                  цонхноос гарах, мөн шалгалтын хэсгээс гарах оролдлогууд
                  анхааруулгад бүртгэгдэнэ.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Камерын хяналт ажиллаж байна
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Олон хүн илрэх, царай харагдахгүй болох, доош удаан харах,
                  эсвэл утас харагдах үед систем анхааруулга өгнө.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Keyboard className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Shortcut болон хуулах үйлдэл хориотой
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Ctrl, Alt, Meta товчлол, F12, PrintScreen, баруун товч,
                  copy, paste, cut зэрэг үйлдлүүдийг систем хориглоно.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Анхааруулга !!!
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Оюутанд өгсөн бүх анхааруулга багшийн хяналтын самбарт бодит
                  хугацаанд (Real-time) бүртгэгдэж очихыг анхаарна уу.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="-mx-0 -mb-0 rounded-b-none border-t-0 bg-transparent px-6 pb-5 pt-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Буцах
          </Button>
          <Button
            type="button"
            onClick={onStart}
            className="bg-[#006d77]"
            disabled={!exam || !canStartExam(exam, currentTime)}
          >
            Шалгалт өгөх
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
