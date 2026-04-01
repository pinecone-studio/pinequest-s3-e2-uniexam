"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { useStudents } from "./_hooks/useStudents";
import StudentTable from "./_components/StudentTable";
import AdvancedFilter from "./_components/AdvancedFilter";
import { Input } from "@/components/ui/input";

import { useStudentSearch } from "./_hooks/use-student-search";
import { Student } from "./type";

const normalizeStudents = (students: Student[]): Student[] => {
  const normalizeTrend = (trend: string): Student["trend"] => {
    if (trend === "up" || trend === "down" || trend === "stable") {
      return trend;
    }
    return "stable";
  };

  return students.map((s) => ({
    ...s,
    course: s.course ?? "-",
    className: s.className ?? "-",
    major: s.major ?? "-",
    trend: normalizeTrend(s.trend),
    lastActive: s.lastActive ?? "-",
    examHistory: s.examHistory ?? [],
  }));
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { students, loading, error } = useStudents();
  const normalizedStudents = normalizeStudents(students);

  const {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    classFilter,
    setClassFilter,
    majorFilter,
    setMajorFilter,
    filteredItems,
  } = useStudentSearch(normalizedStudents);

  const [open, setOpen] = useState<boolean>(false);
  const activeFilterCount =
    courseFilter.length + classFilter.length + majorFilter.length;

  useEffect(() => {
    const course = searchParams.get("course");
    const className = searchParams.get("class");
    const major = searchParams.get("major");

    if (course) setCourseFilter(course.split(","));
    if (className) setClassFilter(className.split(","));
    if (major) setMajorFilter(major.split(","));
  }, [searchParams, setCourseFilter, setClassFilter, setMajorFilter]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (courseFilter.length) params.set("course", courseFilter.join(","));
    if (classFilter.length) params.set("class", classFilter.join(","));
    if (majorFilter.length) params.set("major", majorFilter.join(","));

    router.replace(`?${params.toString()}`);
  }, [courseFilter, classFilter, majorFilter, router]);

  if (loading) {
    return <div className="p-6 text-gray-500">Уншиж байна...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Алдаа: {error}</div>;
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="bg-white p-4 rounded-2xl border flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Input
            className="w-64"
            placeholder="Оюутан хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-[linear-gradient(to_bottom,rgba(36,72,95,0.9)_0%,rgba(41,97,129,0.86)_48%,rgba(49,168,224,0.82)_100%)] text-white transition hover:opacity-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Филтэр
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {(courseFilter.length > 0 || classFilter.length > 0 || majorFilter.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          {courseFilter.map((c) => (
            <div key={c} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800">
              <span>{c}</span>
              <button
                className="text-slate-500 hover:text-slate-900"
                onClick={() => setCourseFilter((prev) => prev.filter((x) => x !== c))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {classFilter.map((c) => (
            <div key={c} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800">
              <span>{c}</span>
              <button
                className="text-slate-500 hover:text-slate-900"
                onClick={() => setClassFilter((prev) => prev.filter((x) => x !== c))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {majorFilter.map((m) => (
            <div key={m} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800">
              <span>{m}</span>
              <button
                className="text-slate-500 hover:text-slate-900"
                onClick={() => setMajorFilter((prev) => prev.filter((x) => x !== m))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              setCourseFilter([]);
              setClassFilter([]);
              setMajorFilter([]);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:border-slate-500"
          >
            <X className="h-3 w-3" />
            Бүгдийг цэвэрлэх
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <StudentTable students={filteredItems} />
      </div>

      <AdvancedFilter
        open={open}
        setOpen={setOpen}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        majorFilter={majorFilter}
        setMajorFilter={setMajorFilter}
      />
    </div>
  );
}
