"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExamCard, type ExamCardExam } from "./_components/ExamCard";
import { SearchExam } from "./_components/SearchExam";
import { SearchTabs } from "./_components/SearchTabs";
import { CreateNewExam } from "./_components/CreateNewExam";
import { isHiddenDashboardExam } from "@/lib/exam-visibility";
import { graphqlRequest } from "@/lib/graphql";
import { toast } from "sonner";

const EXAMS_QUERY = `#graphql
  query ExamsDashboard {
    exams {
      id
      title
      start_time
      end_time
      duration
      image_url
      course {
        id
        name
        code
      }
    }
  }
`;

type GqlExam = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  image_url: string | null;
  course: { id: string; name: string; code: string } | null;
};

function examStatus(start: string, end: string): ExamCardExam["status"] {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return "Драфт";
  if (now < s) return "Төлөвлөгдсөн";
  if (now >= s && now <= e) return "Авагдаж байгаа";
  return "Дууссан";
}

function mapExam(e: GqlExam): ExamCardExam {
  const start = new Date(e.start_time);
  const courseLabel = e.course ? `${e.course.code} — ${e.course.name}` : "Курс";
  const durMin = e.duration;
  const durationLabel =
    durMin >= 60 && durMin % 60 === 0 ? `${durMin / 60} цаг` : `${durMin} мин`;

  return {
    id: e.id,
    title: e.title,
    courseId: e.course?.id ?? "",
    courseLabel,
    dateLabel: start.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    timeLabel: start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
    durationLabel,
    status: examStatus(e.start_time, e.end_time),
    rawStartTime: e.start_time,
    rawDuration: e.duration,
    image_url: e.image_url,
  };
}

export default function ExamDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exams, setExams] = useState<ExamCardExam[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await graphqlRequest<{ exams: GqlExam[] | null }>(
        EXAMS_QUERY,
      );
      const rows = (data.exams ?? [])
        .filter((exam) => !isHiddenDashboardExam(exam.title))
        .map(mapExam)
        .sort(
          (a, b) =>
            new Date(b.rawStartTime).getTime() -
            new Date(a.rawStartTime).getTime(),
        );
      setExams(rows);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Шалгалтууд ачаалагдаагүй.",
      );
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "in-progress" && exam.status !== "Авагдаж байгаа")
          matchesStatus = false;
        if (statusFilter === "scheduled" && exam.status !== "Төлөвлөгдсөн")
          matchesStatus = false;
        if (statusFilter === "completed" && exam.status !== "Дууссан")
          matchesStatus = false;
        if (statusFilter === "drafts" && exam.status !== "Драфт")
          matchesStatus = false;
      }
      return matchesSearch && matchesStatus;
    });
  }, [exams, searchQuery, statusFilter]);

  const handleExamDeleted = useCallback((examId: string) => {
    setExams((prev) => prev.filter((exam) => exam.id !== examId));
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Шалгалтуудын удирдлага
          </h1>
          <CreateNewExam />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <SearchExam value={searchQuery} onChange={setSearchQuery} />
          <SearchTabs value={statusFilter} onValueChange={setStatusFilter} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-400">Шалгалт байхгүй байна.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onExamUpdated={load}
                onExamDeleted={handleExamDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4 shadow-sm">
      {/* Status badge */}
      <div className="h-5 w-20 rounded bg-gray-100 animate-pulse" />
      {/* Title */}
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-gray-100 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-gray-50 animate-pulse" />
      </div>
      {/* Meta */}
      <div className="pt-3 border-t border-gray-50 space-y-2">
        <div className="h-4 w-2/3 rounded bg-gray-50 animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-gray-50 animate-pulse" />
      </div>
    </div>
  );
}
