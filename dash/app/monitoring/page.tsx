"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Monitor, Wifi } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { graphqlRequest } from "@/lib/graphql";

import { MonitoringFilters } from "./_components/MonitoringFilters";
import { MonitoringHeader } from "./_components/MonitoringHeader";
import { MonitoringPageSkeleton } from "./_components/MonitoringPageSkeleton";
import { StatCard } from "./_components/StatCard";
import { monitoringCssVars } from "./_lib/theme";
import {
  LiveMonitorPanel,
  type LiveStudentSnapshot,
} from "./_components/LiveMonitorPanel";
import type { Student, StudentAlert } from "./_lib/types";

type StudentFilter = "all" | "alert";
type ClassOption = { value: string; label: string };
type StudentViolation = {
  id: string;
  type: StudentAlert["type"];
  message: string;
  time: string;
  severity: "warning" | "danger";
};

const MONITORING_QUERY = `#graphql
  query MonitoringPageData {
    students {
      id
      name
      email
    }
    enrollments {
      id
      student_id
      course_id
    }
    courses {
      id
      name
      code
    }
    exams {
      id
      title
      course_id
      start_time
      end_time
      questions {
        id
      }
    }
    submissions {
      id
      student_id
      exam_id
      started_at
      submitted_at
      status
      answers {
        id
      }
    }
    cheatLogs {
      id
      student_id
      exam_id
      type
      event
      severity
      created_at
    }
  }
`;

type MonitoringQueryData = {
  students: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }> | null;
  enrollments: Array<{
    id: string;
    student_id: string;
    course_id: string;
  }> | null;
  courses: Array<{
    id: string;
    name: string | null;
    code: string | null;
  }> | null;
  exams: Array<{
    id: string;
    title: string | null;
    course_id: string | null;
    start_time: string | null;
    end_time: string | null;
    questions: Array<{ id: string }> | null;
  }> | null;
  submissions: Array<{
    id: string;
    student_id: string;
    exam_id: string;
    started_at: string | null;
    submitted_at: string | null;
    status: "in_progress" | "submitted" | "reviewed" | null;
    answers: Array<{ id: string }> | null;
  }> | null;
  cheatLogs: Array<{
    id: string;
    student_id: string | null;
    exam_id: string | null;
    type: string | null;
    event: string | null;
    severity: number | null;
    created_at: string | null;
  }> | null;
};
type GqlSubmission = NonNullable<MonitoringQueryData["submissions"]>[number];
type GqlCheatLog = NonNullable<MonitoringQueryData["cheatLogs"]>[number];

const getTimestamp = (value: string | null | undefined) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

function isExamActiveNow(
  exam: {
    start_time: string | null;
    end_time: string | null;
  },
  nowMs: number,
) {
  const start = getTimestamp(exam.start_time);
  const end = getTimestamp(exam.end_time);
  if (!start || !end) return false;
  return nowMs >= start && nowMs <= end;
}

function toStudentAlertType(
  type: string | null | undefined,
): StudentAlert["type"] {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("phone")) return "phone";
  if (normalized.includes("head")) return "headpose";
  if (normalized.includes("people") || normalized.includes("person"))
    return "people";
  return "tab";
}

function formatClassName(course?: {
  name: string | null;
  code: string | null;
}) {
  if (!course) return "Тодорхойгүй анги";
  const code = course.code?.trim();
  const name = course.name?.trim();
  if (code && name) return `${code} - ${name}`;
  return code ?? name ?? "Тодорхойгүй анги";
}

export default function MonitoringPage() {
  const params = useParams<{ examId?: string | string[] }>();
  const routeExamId = Array.isArray(params?.examId)
    ? params.examId[0]
    : params?.examId;
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeRoomIds, setActiveRoomIds] = useState<string[]>([]);
  const [roomByStudentId, setRoomByStudentId] = useState<
    Record<string, string>
  >({});
  const [courseIdByStudentId, setCourseIdByStudentId] = useState<
    Record<number, string>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [classFilter, setClassFilter] = useState("all");
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [liveStudents, setLiveStudents] = useState<LiveStudentSnapshot[]>([]);
  const [violationsByStudentId, setViolationsByStudentId] = useState<
    Record<number, StudentViolation[]>
  >({});
  const [selectedCompletedStudentId, setSelectedCompletedStudentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadMonitoringData = async () => {
      if (!cancelled) {
        setLoadError(null);
      }

      try {
        const monitoringData =
          await graphqlRequest<MonitoringQueryData>(MONITORING_QUERY);

        const gqlStudents = monitoringData.students ?? [];
        const enrollments = monitoringData.enrollments ?? [];
        const courses = monitoringData.courses ?? [];
        const exams = monitoringData.exams ?? [];
        const allSubmissions = monitoringData.submissions ?? [];
        const allCheatLogs = monitoringData.cheatLogs ?? [];

        const nowMs = Date.now();
        const scopedExamIds = routeExamId
          ? new Set([routeExamId])
          : new Set(
              exams
                .filter((exam) => isExamActiveNow(exam, nowMs))
                .map((exam) => exam.id),
            );

        const scopedSubmissions = allSubmissions.filter((submission) =>
          scopedExamIds.has(submission.exam_id),
        );
        const inProgressSubmissions = scopedSubmissions.filter(
          (submission) => submission.status === "in_progress",
        );
        const submissions = scopedSubmissions;

        const examById = new Map(exams.map((exam) => [exam.id, exam]));
        const scopedCourseIds = new Set(
          Array.from(scopedExamIds)
            .map((examId) => examById.get(examId)?.course_id ?? null)
            .filter((courseId): courseId is string => Boolean(courseId)),
        );

        const liveStudentIds = new Set<string>(
          scopedSubmissions
            .filter(
              (submission) =>
                submission.status === "in_progress" ||
                submission.status === "submitted" ||
                submission.status === "reviewed",
            )
            .map((submission) => submission.student_id),
        );

        // Fallback to enrollments only when no submission exists yet.
        if (liveStudentIds.size === 0) {
          for (const enrollment of enrollments) {
            if (scopedCourseIds.has(enrollment.course_id)) {
              liveStudentIds.add(enrollment.student_id);
            }
          }
        }

        const cheatLogs = (
          routeExamId
            ? allCheatLogs.filter((log) => log.exam_id === routeExamId)
            : allCheatLogs
        ).filter((log) =>
          Boolean(log.student_id && liveStudentIds.has(log.student_id)),
        );

        const courseById = new Map(
          courses.map((course) => [course.id, course]),
        );

        const enrollmentsByStudentId = new Map<string, string[]>();
        for (const enrollment of enrollments) {
          const next = enrollmentsByStudentId.get(enrollment.student_id) ?? [];
          next.push(enrollment.course_id);
          enrollmentsByStudentId.set(enrollment.student_id, next);
        }

        const submissionsByStudentId = new Map<string, GqlSubmission[]>();
        for (const submission of submissions) {
          const next = submissionsByStudentId.get(submission.student_id) ?? [];
          next.push(submission);
          submissionsByStudentId.set(submission.student_id, next);
        }

        const cheatLogsByStudentId = new Map<string, GqlCheatLog[]>();
        for (const log of cheatLogs) {
          if (!log.student_id) continue;
          const next = cheatLogsByStudentId.get(log.student_id) ?? [];
          next.push(log);
          cheatLogsByStudentId.set(log.student_id, next);
        }

        const baseStudents = gqlStudents.filter((student) =>
          liveStudentIds.has(student.id),
        );

        const nextRoomByStudentId: Record<string, string> = {};
        const nextCourseIdByStudentId: Record<number, string> = {};
        const nextViolationsByStudentId: Record<number, StudentViolation[]> =
          {};
        const nextStudents: Student[] = baseStudents.map((student, index) => {
          const studentSubmissions = [
            ...(submissionsByStudentId.get(student.id) ?? []),
          ].sort(
            (a, b) =>
              getTimestamp(b.submitted_at ?? b.started_at) -
              getTimestamp(a.submitted_at ?? a.started_at),
          );
          const activeSubmission = studentSubmissions.find(
            (submission) => submission.status === "in_progress",
          );
          const selectedSubmission = activeSubmission ?? studentSubmissions[0];
          const selectedExam = selectedSubmission
            ? examById.get(selectedSubmission.exam_id)
            : undefined;

          const enrolledCourseId =
            enrollmentsByStudentId.get(student.id)?.[0] ?? null;
          const enrolledCourse = enrolledCourseId
            ? courseById.get(enrolledCourseId)
            : undefined;
          const classCourse = selectedExam?.course_id
            ? courseById.get(selectedExam.course_id)
            : enrolledCourse;
          const className = formatClassName(classCourse);
          const studentCheatLogs =
            cheatLogsByStudentId
              .get(student.id)
              ?.sort(
                (a, b) =>
                  getTimestamp(b.created_at) - getTimestamp(a.created_at),
              ) ?? [];

          const latestAlert = studentCheatLogs[0]
            ? {
                type: toStudentAlertType(studentCheatLogs[0].type),
                message:
                  studentCheatLogs[0].event ??
                  studentCheatLogs[0].type ??
                  "Зөрчил илэрсэн",
                time: new Date(
                  studentCheatLogs[0].created_at ?? Date.now(),
                ).toLocaleString(),
              }
            : null;

          const tabSwitches = studentCheatLogs.length;
          const answeredCount = selectedSubmission?.answers?.length ?? 0;
          const totalQuestions =
            selectedExam?.questions?.length && selectedExam.questions.length > 0
              ? selectedExam.questions.length
              : Math.max(answeredCount, 1);

          const status =
            selectedSubmission?.status === "submitted" ||
            selectedSubmission?.status === "reviewed"
              ? "submitted"
              : selectedSubmission?.status === "in_progress"
                ? "online"
                : "offline";
          const submittedMinutesAgo =
            status === "submitted" && selectedSubmission?.submitted_at
              ? Math.max(
                  0,
                  Math.floor(
                    (nowMs - getTimestamp(selectedSubmission.submitted_at)) /
                      60000,
                  ),
                )
              : undefined;
          const numericStudentId = Number.parseInt(student.id, 10) || index + 1;
          const normalizedStudentId = String(numericStudentId);
          nextViolationsByStudentId[numericStudentId] = studentCheatLogs.map(
            (log, logIndex) => ({
              id: log.id ?? `${student.id}-${logIndex}`,
              type: toStudentAlertType(log.type),
              message: log.event ?? log.type ?? "Зөрчил илэрсэн",
              time: new Date(log.created_at ?? Date.now()).toLocaleString(),
              severity: (log.severity ?? 1) >= 2 ? "danger" : "warning",
            }),
          );
          const selectedCourseId =
            selectedExam?.course_id ?? enrolledCourseId ?? null;
          if (selectedCourseId) {
            nextCourseIdByStudentId[numericStudentId] = selectedCourseId;
          }
          if (selectedSubmission?.exam_id) {
            nextRoomByStudentId[normalizedStudentId] =
              `exam-room-${selectedSubmission.exam_id}`;
          }

          return {
            id: numericStudentId,
            name: student.name ?? "Нэргүй сурагч",
            email: student.email ?? "email-гүй",
            className,
            status,
            currentQuestion: answeredCount,
            totalQuestions,
            submittedMinutesAgo,
            tabSwitches,
            latestAlert,
          };
        });

        const nextClassOptions: ClassOption[] = Array.from(
          new Set(Object.values(nextCourseIdByStudentId)),
        )
          .map((courseId) => ({
            value: courseId,
            label: formatClassName(courseById.get(courseId)),
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        if (!cancelled) {
          setStudents(nextStudents);
          setRoomByStudentId(nextRoomByStudentId);
          setCourseIdByStudentId(nextCourseIdByStudentId);
          setViolationsByStudentId(nextViolationsByStudentId);
          setClassOptions(nextClassOptions);
          setActiveRoomIds(
            Array.from(scopedExamIds).map((examId) => `exam-room-${examId}`),
          );
          setIsLoading(false);
        }
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Monitoring data ачаалж чадсангүй",
        );
        setStudents([]);
        setActiveRoomIds([]);
        setRoomByStudentId({});
        setCourseIdByStudentId({});
        setViolationsByStudentId({});
        setClassOptions([]);
        setIsLoading(false);
      }
    };

    void loadMonitoringData();
    intervalId = setInterval(() => {
      void loadMonitoringData();
    }, 15000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [routeExamId]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStudentFilterChange = (value: StudentFilter) => {
    setStudentFilter(value);
  };

  const handleClassChange = (value: string) => {
    setClassFilter(value);
  };

  useEffect(() => {
    if (classFilter === "all") return;
    const stillExists = classOptions.some(
      (option) => option.value === classFilter,
    );
    if (!stillExists) {
      setClassFilter("all");
    }
  }, [classFilter, classOptions]);

  const classFilteredStudents = useMemo(() => {
    if (classFilter === "all") {
      return students;
    }

    return students.filter(
      (student) => courseIdByStudentId[student.id] === classFilter,
    );
  }, [classFilter, courseIdByStudentId, students]);

  const visibleCompletedStudents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return classFilteredStudents
      .filter((student) => student.status === "submitted")
      .filter((student) => {
        if (!keyword) return true;
        return (
          student.name.toLowerCase().includes(keyword) ||
          student.email.toLowerCase().includes(keyword) ||
          student.className.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const aMinutes = a.submittedMinutesAgo ?? Number.MAX_SAFE_INTEGER;
        const bMinutes = b.submittedMinutesAgo ?? Number.MAX_SAFE_INTEGER;
        return aMinutes - bMinutes;
      });
  }, [classFilteredStudents, searchTerm]);
  const selectedCompletedStudent = useMemo(() => {
    if (selectedCompletedStudentId === null) return null;
    return (
      visibleCompletedStudents.find(
        (student) => student.id === selectedCompletedStudentId,
      ) ?? null
    );
  }, [selectedCompletedStudentId, visibleCompletedStudents]);

  const visibleLiveStudents = useMemo(() => {
    return liveStudents
      .filter((student) => {
        const displayName = (
          student.studentName?.trim() || `Student ${student.peerId.slice(0, 6)}`
        ).toLowerCase();
        const matchesSearch = displayName.includes(searchTerm.toLowerCase());
        const matchesStudentFilter =
          studentFilter === "all" ? true : student.warningCount > 0;
        return matchesSearch && matchesStudentFilter;
      })
      .sort((a, b) => a.roomId.localeCompare(b.roomId));
  }, [liveStudents, searchTerm, studentFilter]);

  const stats = useMemo(() => {
    return {
      total: liveStudents.length,
      online: liveStudents.filter(
        (student) =>
          student.connectionState === "connected" ||
          student.connectionState === "connecting",
      ).length,
      submitted: students.filter((student) => student.status === "submitted")
        .length,
      alerts: liveStudents.filter((student) => student.warningCount > 0).length,
    };
  }, [liveStudents, students]);

  const classFilteredRoomIds = useMemo(() => {
    const scopedStudents =
      classFilter === "all" ? students : classFilteredStudents;
    return Array.from(
      new Set(
        scopedStudents
          .map((student) => roomByStudentId[String(student.id)])
          .filter((roomId): roomId is string => Boolean(roomId)),
      ),
    );
  }, [classFilter, classFilteredStudents, roomByStudentId, students]);

  const panelRoomIds = useMemo(() => {
    if (routeExamId) {
      return [`exam-room-${routeExamId}`];
    }
    return classFilter === "all" ? activeRoomIds : classFilteredRoomIds;
  }, [activeRoomIds, classFilter, classFilteredRoomIds, routeExamId]);

  if (isLoading) {
    return <MonitoringPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={monitoringCssVars}>
      <div className="mx-auto max-w-7xl space-y-4">
        <MonitoringHeader
          classFilter={classFilter}
          isExamScoped={Boolean(routeExamId)}
          classOptions={classOptions}
          onClassChange={handleClassChange}
        />
        {loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Monitoring data ачаалж чадсангүй: {loadError}
          </div>
        ) : null}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 p-0">
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

        <LiveMonitorPanel
          roomIds={panelRoomIds}
          onLiveStudentsChange={setLiveStudents}
        />

        <Card className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--monitoring-dark)]">
                  Сурагчдын явц
                </h2>
                <p className="mt-1 text-sm text-[var(--monitoring-muted)]">
                  Нийт {visibleLiveStudents.length} live сурагч
                </p>
                {routeExamId ? (
                  <p className="mt-1 text-xs text-[var(--monitoring-primary)]">
                    Шалгалтын хяналт: {routeExamId}
                  </p>
                ) : null}
              </div>

              <MonitoringFilters
                searchTerm={searchTerm}
                studentFilter={studentFilter}
                onSearchChange={handleSearchChange}
                onStudentFilterChange={handleStudentFilterChange}
              />
            </div>

            {visibleLiveStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--monitoring-dark-border)] bg-white p-10 text-center text-[var(--monitoring-muted)]">
                Илэрц олдсонгүй.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[var(--monitoring-dark-border)] bg-white">
                <div className="grid grid-cols-12 gap-3 border-b border-[var(--monitoring-dark-border)] bg-gray-50 px-4 py-3 text-xs font-semibold text-[var(--monitoring-muted)]">
                  <div className="col-span-3">Сурагч</div>
                  <div className="col-span-3">Room</div>
                  <div className="col-span-2">Төлөв</div>
                  <div className="col-span-3">Stream</div>
                  <div className="col-span-1 text-right">Зөрчил</div>
                </div>

                <div className="divide-y divide-[var(--monitoring-dark-border)]">
                  {visibleLiveStudents.map((student) => {
                    const hasAlert = student.warningCount > 0;
                    const statusText =
                      student.connectionState === "connected"
                        ? "Онлайн"
                        : student.connectionState === "connecting" ||
                            student.connectionState === "new"
                          ? "Холбогдож байна"
                          : "Тасарсан";

                    return (
                      <div
                        key={student.peerId}
                        className={`grid grid-cols-12 gap-3 px-4 py-3 text-sm ${
                          hasAlert
                            ? "bg-[var(--monitoring-warning-surface)]"
                            : ""
                        }`}
                      >
                        <div className="col-span-3 min-w-0">
                          <p className="truncate font-semibold text-[var(--monitoring-dark)]">
                            {student.studentName?.trim() ||
                              `Student ${student.peerId.slice(0, 6)}`}
                          </p>
                          <p className="truncate text-xs text-[var(--monitoring-muted)]">
                            peer: {student.peerId.slice(0, 12)}
                          </p>
                        </div>

                        <div className="col-span-3 min-w-0">
                          <p className="truncate text-[var(--monitoring-dark)]">
                            {student.roomId}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              student.connectionState === "connected"
                                ? "bg-blue-50 text-blue-600"
                                : student.connectionState === "connecting" ||
                                    student.connectionState === "new"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>

                        <div className="col-span-3">
                          <span className="text-xs text-[var(--monitoring-muted)]">
                            {student.isStreaming
                              ? "Camera stream ирж байна"
                              : "Stream хүлээж байна"}
                          </span>
                        </div>

                        <div className="col-span-1 text-right">
                          <span
                            className={`text-xs font-semibold ${
                              hasAlert
                                ? "text-[var(--monitoring-warning)]"
                                : "text-gray-400"
                            }`}
                          >
                            {student.warningCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[var(--monitoring-dark)]">
                Шалгалтаа дууссан сурагчид
              </h3>
              <p className="mt-1 text-sm text-[var(--monitoring-muted)]">
                Нийт {visibleCompletedStudents.length} сурагч
              </p>
            </div>

            {visibleCompletedStudents.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[var(--monitoring-dark-border)] bg-white p-8 text-center text-[var(--monitoring-muted)]">
                Одоогоор шалгалтаа дууссан сурагч алга.
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--monitoring-dark-border)] bg-white">
                <div className="grid grid-cols-12 gap-3 border-b border-[var(--monitoring-dark-border)] bg-gray-50 px-4 py-3 text-xs font-semibold text-[var(--monitoring-muted)]">
                  <div className="col-span-3">Сурагч</div>
                  <div className="col-span-3">Анги</div>
                  <div className="col-span-2">Явц</div>
                  <div className="col-span-3">Илгээсэн</div>
                  <div className="col-span-1 text-right">Зөрчил</div>
                </div>

                <div className="divide-y divide-[var(--monitoring-dark-border)]">
                  {visibleCompletedStudents.map((student) => (
                    <button
                      type="button"
                      key={`submitted-${student.id}`}
                      onClick={() => setSelectedCompletedStudentId(student.id)}
                      className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left text-sm transition hover:bg-[var(--monitoring-primary-soft)]"
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
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          {student.currentQuestion}/{student.totalQuestions}
                        </span>
                      </div>

                      <div className="col-span-3">
                        <span className="text-xs text-[var(--monitoring-muted)]">
                          {student.submittedMinutesAgo === undefined
                            ? "Хугацаа тодорхойгүй"
                            : student.submittedMinutesAgo === 0
                              ? "Сая илгээсэн"
                              : `${student.submittedMinutesAgo} мин өмнө`}
                        </span>
                      </div>

                      <div className="col-span-1 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            student.tabSwitches > 0
                              ? "text-[var(--monitoring-warning)]"
                              : "text-gray-400"
                          }`}
                        >
                          {student.tabSwitches}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={selectedCompletedStudentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCompletedStudentId(null);
          }
        }}
      >
        <DialogContent className="border-[var(--monitoring-dark-border)] bg-white text-[var(--monitoring-dark)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Зөрчлийн дэлгэрэнгүй</DialogTitle>
            <DialogDescription className="text-[var(--monitoring-muted)]">
              {selectedCompletedStudent
                ? `${selectedCompletedStudent.name} сурагчийн илэрсэн зөрчил`
                : "Сурагчийн зөрчлийн мэдээлэл"}
            </DialogDescription>
          </DialogHeader>

          {selectedCompletedStudent ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--monitoring-dark-border)] bg-[var(--monitoring-primary-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--monitoring-dark)]">
                  {selectedCompletedStudent.name}
                </p>
                <p className="text-sm text-[var(--monitoring-muted)]">
                  {selectedCompletedStudent.email}
                </p>
                <p className="mt-1 text-xs text-[var(--monitoring-muted)]">
                  {selectedCompletedStudent.className}
                </p>
              </div>

              {(violationsByStudentId[selectedCompletedStudent.id] ?? [])
                .length > 0 ? (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {(
                    violationsByStudentId[selectedCompletedStudent.id] ?? []
                  ).map((violation) => (
                    <div
                      key={violation.id}
                      className={`rounded-lg border p-3 ${
                        violation.severity === "danger"
                          ? "border-red-200 bg-red-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-[var(--monitoring-dark)]">
                          {violation.message}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            violation.severity === "danger"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {violation.severity === "danger"
                            ? "Danger"
                            : "Warning"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--monitoring-muted)]">
                        Төрөл: {violation.type} | Хугацаа: {violation.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--monitoring-dark-border)] p-5 text-sm text-[var(--monitoring-muted)]">
                  Энэ сурагч дээр одоогоор бүртгэгдсэн зөрчил алга.
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
