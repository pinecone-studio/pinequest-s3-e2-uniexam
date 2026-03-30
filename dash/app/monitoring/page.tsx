"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Monitor, Wifi } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { MonitoringFilters } from "./_components/MonitoringFilters";
import { MonitoringHeader } from "./_components/MonitoringHeader";
import { MonitoringPagination } from "./_components/MonitoringPagination";
import { MonitoringPageSkeleton } from "./_components/MonitoringPageSkeleton";
import { StatCard } from "./_components/StatCard";
import { StudentCard } from "./_components/StudentCard";
import { students } from "./_data/students";
import { monitoringCssVars } from "./_lib/theme";

type StudentFilter = "all" | "alert";

const PAGE_SIZE = 8;

export default function MonitoringPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [classFilter, setClassFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStudentFilterChange = (value: StudentFilter) => {
    setStudentFilter(value);
    setCurrentPage(1);
  };

  const handleClassChange = (value: string) => {
    setClassFilter(value);
    setCurrentPage(1);
  };

  const classOptions = useMemo(() => {
    return Array.from(new Set(students.map((student) => student.className)));
  }, []);

  const classFilteredStudents = useMemo(() => {
    if (classFilter === "all") {
      return students;
    }

    return students.filter((student) => student.className === classFilter);
  }, [classFilter]);

  const visibleStudents = useMemo(() => {
    return classFilteredStudents.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStudentFilter =
        studentFilter === "all"
          ? true
          : student.tabSwitches > 0 || Boolean(student.latestAlert);

      return matchesSearch && matchesStudentFilter;
    });
  }, [classFilteredStudents, searchTerm, studentFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
  };

  const paginatedStudents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return visibleStudents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [visibleStudents, safeCurrentPage]);

  const stats = useMemo(() => {
    return {
      total: classFilteredStudents.length,
      online: classFilteredStudents.filter(
        (student) => student.status === "online",
      ).length,
      submitted: classFilteredStudents.filter(
        (student) => student.status === "submitted",
      ).length,
      alerts: classFilteredStudents.filter(
        (student) => student.tabSwitches > 0 || Boolean(student.latestAlert),
      ).length,
    };
  }, [classFilteredStudents]);

  if (isLoading) {
    return <MonitoringPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={monitoringCssVars}>
      <div className="mx-auto max-w-7xl space-y-4">
        <MonitoringHeader
          classFilter={classFilter}
          classOptions={classOptions}
          onClassChange={handleClassChange}
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 ">
          <StatCard
            title="Нийт сурагч"
            value={stats.total}
            icon={Monitor}
            tone="dark"
          />

          <StatCard
            title="Одоо онлайн"
            value={stats.online}
            icon={Wifi}
            tone="primary"
          />

          <StatCard
            title="Илгээсэн"
            value={stats.submitted}
            icon={CheckCircle2}
            tone="primary"
          />

          <StatCard
            title="Нийт анхааруулга"
            value={stats.alerts}
            icon={AlertTriangle}
            tone="warning"
          />
        </div>

        <Card className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--monitoring-dark)]">
                  Сурагчдын явц
                </h2>
                <p className="mt-1 text-sm text-[var(--monitoring-muted)]">
                  Нийт {visibleStudents.length} сурагчийн илэрц
                </p>
              </div>

              <MonitoringFilters
                searchTerm={searchTerm}
                studentFilter={studentFilter}
                onSearchChange={handleSearchChange}
                onStudentFilterChange={handleStudentFilterChange}
              />
            </div>

            {visibleStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--monitoring-dark-border)] bg-white p-10 text-center text-[var(--monitoring-muted)]">
                Илэрц олдсонгүй.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {paginatedStudents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>

                <MonitoringPagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
