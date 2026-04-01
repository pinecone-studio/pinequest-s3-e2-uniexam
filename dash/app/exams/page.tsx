"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExamCard, type ExamCardExam } from "./_components/ExamCard";
import { SearchExam } from "./_components/SearchExam";
import { SearchTabs } from "./_components/SearchTabs";
import { CreateNewExam } from "./_components/CreateNewExam";
import { isHiddenDashboardExam } from "@/lib/exam-visibility";
import { graphqlRequest } from "@/lib/graphql";
import { Loader2 } from "lucide-react";
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

const ExamDashboard = () => {
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

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Шалгалт</h1>
        </div>

        <CreateNewExam />
      </div>

      <div className="space-y-4 mb-8">
        <SearchExam value={searchQuery} onChange={setSearchQuery} />
        <SearchTabs value={statusFilter} onValueChange={setStatusFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredExams.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-16 rounded-xl border border-dashed bg-white">
          Шалгалт олдсонгүй.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onExamUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamDashboard;
