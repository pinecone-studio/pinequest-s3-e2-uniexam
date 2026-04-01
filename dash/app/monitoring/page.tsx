"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Monitor, Wifi } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { MonitoringFilters } from "./_components/MonitoringFilters";
import { MonitoringHeader } from "./_components/MonitoringHeader";
import { MonitoringPageSkeleton } from "./_components/MonitoringPageSkeleton";
import { StatCard } from "./_components/StatCard";
import { students } from "./_data/students";
import { monitoringCssVars } from "./_lib/theme";
import { LiveMonitorPanel } from "./_components/LiveMonitorPanel";

type StudentFilter = "all" | "alert";

const PAGE_SIZE = 8;

export default function MonitoringPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStudentFilterChange = (value: StudentFilter) => {
    setStudentFilter(value);
  };

  const handleClassChange = (value: string) => {
    setClassFilter(value);
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
        <LiveMonitorPanel roomId="exam-room-1" />
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
              <div className="overflow-hidden rounded-2xl border border-[var(--monitoring-dark-border)] bg-white">
                <div className="grid grid-cols-12 gap-3 border-b border-[var(--monitoring-dark-border)] bg-gray-50 px-4 py-3 text-xs font-semibold text-[var(--monitoring-muted)]">
                  <div className="col-span-3">Сурагч</div>
                  <div className="col-span-3">Анги</div>
                  <div className="col-span-2">Төлөв</div>
                  <div className="col-span-3">Ахиц</div>
                  <div className="col-span-1 text-right">Зөрчил</div>
                </div>

                <div className="divide-y divide-[var(--monitoring-dark-border)]">
                  {visibleStudents.map((student) => {
                    const hasAlert =
                      student.tabSwitches > 0 || Boolean(student.latestAlert);
                    const statusText =
                      student.status === "online"
                        ? "Онлайн"
                        : student.status === "offline"
                          ? "Офлайн"
                          : "Илгээсэн";

                    const progressPercent = Math.round(
                      (student.currentQuestion / student.totalQuestions) * 100,
                    );

                    return (
                      <div
                        key={student.id}
                        className={`grid grid-cols-12 gap-3 px-4 py-3 text-sm ${
                          hasAlert
                            ? "bg-[var(--monitoring-warning-surface)]"
                            : ""
                        }`}
                      >
                        <div className="col-span-3 min-w-0">
                          <p className="truncate font-semibold text-[var(--monitoring-dark)]">
                            {student.name}
                          </p>
                          <p className="truncate text-xs text-[var(--monitoring-muted)]">
                            {student.email}
                          </p>
                        </div>

                        <div className="col-span-3 min-w-0">
                          <p className="truncate text-[var(--monitoring-dark)]">
                            {student.className}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              student.status === "online"
                                ? "bg-blue-50 text-blue-600"
                                : student.status === "offline"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-green-50 text-green-600"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>

                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-gray-100">
                              <div
                                className="h-2 rounded-full bg-[var(--monitoring-primary)]"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs text-[var(--monitoring-muted)]">
                              {student.currentQuestion}/{student.totalQuestions}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1 text-right">
                          <span
                            className={`text-xs font-semibold ${
                              hasAlert
                                ? "text-[var(--monitoring-warning)]"
                                : "text-gray-400"
                            }`}
                          >
                            {student.tabSwitches}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
