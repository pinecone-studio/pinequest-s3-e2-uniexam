"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleX,
  FileCheck2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PracticeHistoryEntry } from "./practiceTypes";

type PracticeHistoryProps = {
  items: PracticeHistoryEntry[];
  loading: boolean;
};

const formatSubmittedAt = (value: string) => {
  const submittedAt = new Date(value);

  if (Number.isNaN(submittedAt.getTime())) {
    return "Огноо тодорхойгүй";
  }

  const date = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(submittedAt);

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(submittedAt);

  return `${date} · ${time}`;
};

const formatSubmittedDateOnly = (value: string) => {
  const submittedAt = new Date(value);

  if (Number.isNaN(submittedAt.getTime())) {
    return "Огноо тодорхойгүй";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(submittedAt);
};

export default function PracticeHistory({
  items,
  loading,
}: PracticeHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PracticeHistoryEntry | null>(
    null,
  );

  return (
    <section className="mt-14">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-4 py-4 text-left transition-all hover:cursor-pointer"
      >
        <h2 className="whitespace-nowrap text-[16px] font-bold text-slate-800 transition-colors">
          Бэлтгэлийн түүх
        </h2>

        <div className="relative h-[1.5px] flex-1 overflow-hidden rounded-full bg-slate-200" />

        <div
          className={cn(
            "rounded-full bg-slate-50 p-1.5 text-slate-400 transition-all duration-200",
            !isOpen && "group-hover:bg-slate-100",
          )}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen
            ? "mt-6 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pt-1">
            {loading ? (
              <>
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`practice-history-skeleton-${index + 1}`}
                    className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                      <div className="min-w-0 space-y-2">
                        <Skeleton className="h-3 w-24 bg-slate-200" />
                        <Skeleton className="h-4 w-48 bg-slate-200" />
                        <Skeleton className="h-3 w-32 bg-slate-200" />
                      </div>
                    </div>

                    <Skeleton className="h-9 w-24 rounded-full bg-slate-200 md:self-center" />
                  </div>
                ))}
              </>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-500">
                Одоогоор бэлтгэл шалгалтын түүх алга.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-left transition-colors hover:cursor-pointer hover:border-[#bfe3dd] hover:bg-[#f7fbfa] md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f1] text-[#006d77]">
                      <BookOpen className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      {item.subject ? (
                        <p className="text-[11px] font-medium text-[#006d77]">
                          {item.subject}
                        </p>
                      ) : null}

                      <h3 className="text-[13px] font-semibold text-gray-800 md:text-[16px]">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 pt-1 text-xs text-gray-500">
                        <CalendarDays className="h-3 w-3" />
                        <span>{formatSubmittedAt(item.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex self-start items-center gap-2 rounded-full bg-[#e6f4f1] px-4 py-2 text-xs font-medium text-[#006d77] md:self-center">
                    <FileCheck2 className="h-4 w-4" />
                    <span>
                      {item.score}/{item.totalQuestions} зөв
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {selectedItem?.title ?? "Шалгалтын бэлтгэл түүх"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Энэ бэлтгэл шалгалтын оролдлогын хариу, зөв хариулт, тайлбарууд.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(85vh-92px)] overflow-y-auto px-6 py-5">
            {selectedItem ? (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Хичээл</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedItem.subject ?? "Тодорхойгүй"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Огноо</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatSubmittedDateOnly(selectedItem.submittedAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Оноо</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedItem.score}/{selectedItem.totalQuestions}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedItem.details.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-[#006d77]">
                            Асуулт {item.orderIndex}
                          </p>
                          <h4 className="mt-1 text-sm font-semibold text-slate-900">
                            {item.question}
                          </h4>
                        </div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium",
                            item.isCorrect
                              ? "bg-[#e6f4f1] text-[#006d77]"
                              : "bg-red-50 text-red-600",
                          )}
                        >
                          {item.isCorrect ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <CircleX className="h-3.5 w-3.5" />
                          )}
                          {item.isCorrect ? "Зөв" : "Буруу"}
                        </div>
                      </div>

                      <div className="mt-3 space-y-3">
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-medium text-slate-500">
                            Таны хариулт
                          </p>
                          <p className="mt-1 text-sm text-slate-800">
                            {item.studentAnswer}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#f6fbfa] px-4 py-3">
                          <p className="text-[11px] font-medium text-[#006d77]">
                            Зөв хариулт
                          </p>
                          <p className="mt-1 text-sm text-slate-800">
                            {item.correctAnswer}
                          </p>
                        </div>

                        {item.explanation ? (
                          <div className="rounded-xl border border-[#d4ece6] bg-[#f6fbfa] px-4 py-3">
                            <p className="text-[11px] font-medium text-[#006d77]">
                              Тайлбар
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {item.explanation}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
